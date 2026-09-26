import * as cdk from "aws-cdk-lib";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as route53 from "aws-cdk-lib/aws-route53";
import * as route53targets from "aws-cdk-lib/aws-route53-targets";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import { Construct } from "constructs";
import * as path from "path";

export interface PortfolioDomain {
  /** Apex domain, e.g. parmpreet.dev. www.<domainName> redirects to it. */
  domainName: string;
  /** Route 53 hosted zone that owns domainName (Route 53 mode). */
  hostedZoneId?: string;
  zoneName?: string;
  /**
   * Existing us-east-1 ACM cert covering domainName and www.domainName (e.g. a *.domainName wildcard)
   * (external DNS mode: records are created by hand at the DNS provider).
   */
  certificateArn?: string;
}

export interface PortfolioStackProps extends cdk.StackProps {
  /** Built static site directory (Portfolio/dist). */
  sitePath: string;
  domain?: PortfolioDomain;
}

/**
 * Portfolio SPA on a private S3 bucket behind CloudFront (OAC), with an
 * optional custom domain: either Route 53 managed (DNS-validated ACM cert +
 * alias records) or an imported cert with DNS records kept elsewhere.
 */
export class PortfolioStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: PortfolioStackProps) {
    super(scope, id, props);
    const { sitePath, domain } = props;

    // Private bucket; content is rebuildable, so teardown deletes it.
    const bucket = new s3.Bucket(this, "SiteBucket", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });

    let certificate: acm.ICertificate | undefined;
    let zone: route53.IHostedZone | undefined;
    const wwwName = domain ? `www.${domain.domainName}` : undefined;
    if (domain?.certificateArn) {
      certificate = acm.Certificate.fromCertificateArn(this, "Certificate", domain.certificateArn);
    } else if (domain?.hostedZoneId && domain.zoneName) {
      zone = route53.HostedZone.fromHostedZoneAttributes(this, "Zone", {
        hostedZoneId: domain.hostedZoneId,
        zoneName: domain.zoneName,
      });
      certificate = new acm.Certificate(this, "Certificate", {
        domainName: domain.domainName,
        subjectAlternativeNames: [wwwName!],
        validation: acm.CertificateValidation.fromDns(zone),
      });
    }

    // www.<domain> -> 301 to the apex, so there is one canonical URL.
    const wwwRedirect = domain
      ? new cloudfront.Function(this, "WwwRedirect", {
          runtime: cloudfront.FunctionRuntime.JS_2_0,
          code: cloudfront.FunctionCode.fromInline(`
function handler(event) {
  var req = event.request;
  if (req.headers.host && req.headers.host.value === "${wwwName}") {
    return {
      statusCode: 301,
      statusDescription: "Moved Permanently",
      headers: { location: { value: "https://${domain.domainName}" + req.uri } },
    };
  }
  return req;
}`),
        })
      : undefined;

    const securityHeaders = new cloudfront.ResponseHeadersPolicy(this, "SecurityHeaders", {
      securityHeadersBehavior: {
        strictTransportSecurity: {
          accessControlMaxAge: cdk.Duration.days(365),
          includeSubdomains: true,
          override: true,
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: cloudfront.HeadersFrameOption.DENY, override: true },
        referrerPolicy: {
          referrerPolicy: cloudfront.HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: true,
        },
      },
    });

    const distribution = new cloudfront.Distribution(this, "Distribution", {
      comment: "Parmpreet Singh portfolio",
      defaultRootObject: "index.html",
      httpVersion: cloudfront.HttpVersion.HTTP2_AND_3,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        // Honors the per-object Cache-Control set below: hashed assets cache
        // for a year, index.html revalidates on every request.
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: securityHeaders,
        compress: true,
        ...(wwwRedirect
          ? {
              functionAssociations: [
                { function: wwwRedirect, eventType: cloudfront.FunctionEventType.VIEWER_REQUEST },
              ],
            }
          : {}),
      },
      // The site has no client-side routes (only #section links), so unknown
      // paths get a real 404 page. A private bucket answers missing keys with
      // 403, so map that to 404 too.
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 404, responsePagePath: "/404.html", ttl: cdk.Duration.minutes(5) },
        { httpStatus: 404, responseHttpStatus: 404, responsePagePath: "/404.html", ttl: cdk.Duration.minutes(5) },
      ],
      ...(domain && certificate ? { domainNames: [domain.domainName, wwwName!], certificate } : {}),
    });

    // Vite fingerprints everything under assets/, so it is immutable. Upload it
    // first without pruning, so an index.html still cached somewhere never
    // points at a bundle that was just deleted.
    const assets = new s3deploy.BucketDeployment(this, "DeployAssets", {
      sources: [s3deploy.Source.asset(path.join(sitePath, "assets"))],
      destinationBucket: bucket,
      destinationKeyPrefix: "assets/",
      cacheControl: [s3deploy.CacheControl.fromString("public, max-age=31536000, immutable")],
      prune: false,
    });

    // Everything else (index.html, favicon, public/ files) last: always
    // revalidated, and CloudFront invalidated so the new version shows at once.
    const html = new s3deploy.BucketDeployment(this, "DeployHtml", {
      sources: [s3deploy.Source.asset(sitePath, { exclude: ["assets", "assets/**"] })],
      destinationBucket: bucket,
      cacheControl: [s3deploy.CacheControl.fromString("no-cache")],
      prune: false,
      distribution,
      distributionPaths: ["/*"],
    });
    html.node.addDependency(assets);

    if (domain && zone) {
      const target = route53.RecordTarget.fromAlias(new route53targets.CloudFrontTarget(distribution));
      new route53.ARecord(this, "AliasA", { zone, recordName: domain.domainName, target });
      new route53.AaaaRecord(this, "AliasAAAA", { zone, recordName: domain.domainName, target });
      new route53.ARecord(this, "WwwAliasA", { zone, recordName: wwwName, target });
      new route53.AaaaRecord(this, "WwwAliasAAAA", { zone, recordName: wwwName, target });
    }

    new cdk.CfnOutput(this, "BucketName", { value: bucket.bucketName });
    new cdk.CfnOutput(this, "DistributionId", { value: distribution.distributionId });
    new cdk.CfnOutput(this, "SiteUrl", {
      value: domain ? `https://${domain.domainName}` : `https://${distribution.distributionDomainName}`,
    });
  }
}
