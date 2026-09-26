import * as cdk from "aws-cdk-lib";
import * as fs from "fs";
import * as path from "path";
import { PortfolioStack } from "../lib/portfolio-stack";

const app = new cdk.App();

// Built Vite output. `npm run deploy` builds it first; fail loudly if it is
// missing rather than shipping an empty bucket.
const sitePath = path.join(__dirname, "../../dist");
if (!fs.existsSync(path.join(sitePath, "index.html"))) {
  throw new Error(`No build found at ${sitePath}. Run "npm run build" in Portfolio/ first.`);
}

// Optional custom domain, passed as context (local defaults live in the
// gitignored cdk.context.json).
// Route 53 mode (cert + records managed here):
//   npx cdk deploy -c domainName=parmpreet.dev -c hostedZoneId=Z123 -c zoneName=parmpreet.dev
// External DNS mode (Cloudflare holds the records, cert requested out of band):
//   npx cdk deploy -c domainName=parmpreet.dev -c certificateArn=arn:aws:acm:us-east-1:...
// Without a domain the site is served on its *.cloudfront.net URL.
const domainName = app.node.tryGetContext("domainName") as string | undefined;
const hostedZoneId = app.node.tryGetContext("hostedZoneId") as string | undefined;
const zoneName = app.node.tryGetContext("zoneName") as string | undefined;
const certificateArn = app.node.tryGetContext("certificateArn") as string | undefined;

new PortfolioStack(app, "PortfolioStack", {
  // us-east-1: CloudFront certificates must live there.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-1" },
  sitePath,
  domain:
    domainName && ((hostedZoneId && zoneName) || certificateArn)
      ? { domainName, hostedZoneId, zoneName, certificateArn }
      : undefined,
});
