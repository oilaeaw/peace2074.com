# Email Setup Guide for peace2074.com

This guide will help you set up email for your peace2074.com domain hosted on Netlify.

## Important: Netlify Does Not Provide Email Hosting

**Netlify is a web hosting platform and does not provide email hosting services.** You'll need to use a separate email provider and configure your domain's DNS records to point to that provider.

## Recommended Email Providers

Here are some popular options for setting up email with your custom domain:

### 1. Google Workspace (Formerly G Suite)
- **Cost**: Starting at $6/user/month
- **Best For**: Professional use, businesses
- **Features**: Gmail interface, 30GB+ storage, Google Drive, Calendar, Meet
- **Website**: https://workspace.google.com

### 2. Microsoft 365 (Outlook)
- **Cost**: Starting at $6/user/month
- **Best For**: Professional use, Microsoft ecosystem users
- **Features**: Outlook, OneDrive, Office apps, 50GB mailbox
- **Website**: https://www.microsoft.com/microsoft-365/business

### 3. Zoho Mail
- **Cost**: Free for up to 5 users (with 5GB/user), paid plans from $1/user/month
- **Best For**: Small businesses, budget-conscious users
- **Features**: Ad-free, mobile apps, decent storage
- **Website**: https://www.zoho.com/mail/

### 4. ProtonMail
- **Cost**: Free plan available, paid plans from $4.99/month
- **Best For**: Privacy-focused users
- **Features**: End-to-end encryption, based in Switzerland
- **Website**: https://proton.me/mail

### 5. ImprovMX (Email Forwarding)
- **Cost**: Free for basic forwarding, $9/month for premium
- **Best For**: Simple email forwarding to existing email address
- **Features**: Forward emails from your@peace2074.com to your existing email
- **Website**: https://improvmx.com

### 6. Cloudflare Email Routing (Forwarding Only)
- **Cost**: Free
- **Best For**: Simple email forwarding
- **Features**: Forward unlimited emails to existing addresses
- **Note**: Requires using Cloudflare DNS
- **Website**: https://developers.cloudflare.com/email-routing/

## Setup Instructions

### Option A: Using Zoho Mail (Free Tier)

This is a good option for getting started with professional email at no cost.

#### Step 1: Sign Up for Zoho Mail
1. Go to https://www.zoho.com/mail/
2. Click "Sign Up Now"
3. Choose the Free plan
4. Enter your domain name: `peace2074.com`
5. Complete the registration

#### Step 2: Verify Domain Ownership
Zoho will ask you to verify you own the domain by adding a TXT record:

1. Log into your Netlify account
2. Go to your site dashboard
3. Navigate to **Domain settings** → **DNS records**
4. Click **Add new record**
5. Add the TXT record provided by Zoho:
   - **Record type**: TXT
   - **Name**: @ (or your domain)
   - **Value**: (the verification code from Zoho)
   - **TTL**: 3600

#### Step 3: Configure MX Records
Add the following MX records in Netlify DNS:

1. **MX Record 1**:
   - **Record type**: MX
   - **Name**: @ (or leave blank)
   - **Value**: `mx.zoho.com`
   - **Priority**: 10
   - **TTL**: 3600

2. **MX Record 2**:
   - **Record type**: MX
   - **Name**: @ (or leave blank)
   - **Value**: `mx2.zoho.com`
   - **Priority**: 20
   - **TTL**: 3600

3. **MX Record 3**:
   - **Record type**: MX
   - **Name**: @ (or leave blank)
   - **Value**: `mx3.zoho.com`
   - **Priority**: 50
   - **TTL**: 3600

#### Step 4: Add SPF Record
Add an SPF record to prevent spoofing:

- **Record type**: TXT
- **Name**: @ (or your domain)
- **Value**: `v=spf1 include:zoho.com ~all`
- **TTL**: 3600

#### Step 5: Add DKIM Record (Optional but Recommended)
Zoho will provide you with a DKIM record for better email deliverability:

1. In Zoho Mail admin console, go to Email Configuration → DKIM
2. Generate the DKIM key
3. Add the TXT record provided in Netlify DNS

#### Step 6: Create Email Accounts
1. In Zoho Mail admin console, go to **Users**
2. Click **Add User**
3. Create email addresses like:
   - `contact@peace2074.com`
   - `admin@peace2074.com`
   - `support@peace2074.com`

### Option B: Using ImprovMX (Email Forwarding - Easiest)

If you just want to forward emails to your existing Gmail/Outlook account:

#### Step 1: Sign Up
1. Go to https://improvmx.com
2. Enter your domain: `peace2074.com`
3. Enter the email address where you want to receive forwarded emails

#### Step 2: Configure MX Records in Netlify
Add these MX records in Netlify DNS settings:

1. **MX Record 1**:
   - **Record type**: MX
   - **Name**: @ (or leave blank)
   - **Value**: `mx1.improvmx.com`
   - **Priority**: 10

2. **MX Record 2**:
   - **Record type**: MX
   - **Name**: @ (or leave blank)
   - **Value**: `mx2.improvmx.com`
   - **Priority**: 20

#### Step 3: Wait for DNS Propagation
- DNS changes can take 1-48 hours to propagate
- ImprovMX will automatically detect the changes

#### Step 4: Set Up Aliases
In ImprovMX dashboard, you can create email aliases:
- `contact@peace2074.com` → forwards to your personal email
- `info@peace2074.com` → forwards to your personal email
- etc.

### Option C: Using Google Workspace

#### Step 1: Sign Up
1. Go to https://workspace.google.com
2. Start a free trial or purchase a subscription
3. Enter your domain: `peace2074.com`

#### Step 2: Verify Domain
Google will provide verification methods (similar to Zoho)

#### Step 3: Configure MX Records
Add Google's MX records in Netlify DNS:

1. Priority 1: `ASPMX.L.GOOGLE.COM`
2. Priority 5: `ALT1.ASPMX.L.GOOGLE.COM`
3. Priority 5: `ALT2.ASPMX.L.GOOGLE.COM`
4. Priority 10: `ALT3.ASPMX.L.GOOGLE.COM`
5. Priority 10: `ALT4.ASPMX.L.GOOGLE.COM`

(Google provides exact values during setup)

## Accessing Netlify DNS Settings

To add DNS records in Netlify:

1. Log into your Netlify account at https://app.netlify.com
2. Select your peace2074.com site
3. Go to **Domain settings** (in the site menu)
4. Scroll down to **DNS records** section
5. Click **Add new record** or **Options** → **Go to DNS panel**

## Testing Your Email Setup

After DNS propagation (allow 24-48 hours):

1. **Test receiving**: Send an email to your new address from another email account
2. **Test sending**: Reply to that email or send a new one
3. **Check spam folders**: Initial emails might land in spam until reputation builds

### DNS Propagation Check Tools
- https://mxtoolbox.com/SuperTool.aspx - Check MX records
- https://dnschecker.org - Check DNS propagation worldwide
- https://toolbox.googleapps.com/apps/checkmx/ - Google's MX record checker

## Troubleshooting

### Emails Not Being Received
- Check if MX records are correctly configured in Netlify DNS
- Verify DNS propagation is complete (wait 24-48 hours)
- Check your email provider's admin console for bounce messages
- Ensure SPF/DKIM records are configured

### Emails Going to Spam
- Add SPF record
- Configure DKIM
- Add DMARC record (advanced)
- Build sender reputation by sending legitimate emails

### Can't Send Emails
- Verify you've created the email account in your provider
- Check SMTP settings if using email client
- Ensure you're authenticated properly

## Additional Security: DMARC

After setting up SPF and DKIM, add a DMARC record for extra security:

- **Record type**: TXT
- **Name**: `_dmarc`
- **Value**: `v=DMARC1; p=quarantine; rua=mailto:dmarc@peace2074.com`

## Recommendations

For **peace2074.com** (an Islamic platform):

1. **For starting out**: Use **ImprovMX** (free) to forward emails to your personal account
2. **For professional use**: Use **Zoho Mail Free** (up to 5 users) or **Google Workspace**
3. **For privacy**: Use **ProtonMail**

## Need Help?

If you encounter issues:
1. Check your email provider's documentation
2. Verify DNS records using MX Toolbox
3. Contact your email provider's support
4. Netlify support can help with DNS record questions: https://www.netlify.com/support/

---

**Remember**: Netlify handles your website, but email requires a separate service. Once DNS is configured, both work together seamlessly!
