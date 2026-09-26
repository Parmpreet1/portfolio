# Parmpreet Singh · Portfolio

A fast, responsive single-page portfolio built with **React + TypeScript + Vite**.

## Run it

```bash
npm install
npm run dev        # start dev server (http://localhost:5173)
npm run build      # typecheck + production build → dist/
npm run preview    # preview the production build
npm run typecheck  # run the TypeScript compiler with no emit
```

## Customize

All content lives in **`src/data.ts`**: edit your profile, stats, about,
skills, projects, and experience there. It's fully typed, so your editor
will guide you. No component changes needed.

- Colors & design tokens: top of `src/index.css` (`:root`)
- Icons: `src/Icon.tsx`
- Layout / sections: `src/App.tsx`

## Deploy

AWS (S3 + CloudFront) via CDK, in `cdk/` (`PortfolioStack`, us-east-1):

```bash
cd cdk
npm install
npm run diff       # builds the site, shows what will change
npm run deploy     # builds the site and deploys; prints SiteUrl
```

Live at **https://parmpreet.dev**.

Custom domain (optional), two modes. `www.<domain>` always redirects to the apex.

Route 53 (the stack creates the certificate and DNS records):

```bash
npm run build:site
npx cdk deploy PortfolioStack -c domainName=example.com -c hostedZoneId=Z123 -c zoneName=example.com
```

External DNS, e.g. Cloudflare (bring a us-east-1 ACM certificate that covers the apex and `www`,
then point both names at the distribution with DNS-only CNAME records):

```bash
npm run build:site
npx cdk deploy PortfolioStack -c domainName=example.com -c certificateArn=arn:aws:acm:us-east-1:...
```

To avoid passing flags every time, put `domainName` and `certificateArn` in `cdk/cdk.context.json`
(gitignored, so account-specific values stay out of the repo).
