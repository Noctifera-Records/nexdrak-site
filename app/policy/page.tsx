import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | NexDrak",
  description: "Privacy Policy for NexDrak.com",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Introduction</h2>
          <p>
            Welcome to NexDrak.com. We respect your privacy and are committed to protecting your personal data.
            This privacy policy will inform you as to how we look after your personal data when you visit our website
            and tell you about your privacy rights and how the law protects you.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track the activity on our Service and store certain information.
            Tracking technologies used are beacons, tags, and scripts to collect and track information and to improve and analyze our Service.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Session Cookies:</strong> We use Session Cookies to operate our Service, specifically for maintaining your authentication state.</li>
            <li><strong>Preference Cookies:</strong> We use Preference Cookies to remember your preferences and various settings, such as your preferred theme (light or dark mode).</li>
            <li><strong>Security Cookies:</strong> We use Security Cookies for security purposes.</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. Data Collection</h2>
          <p>
            We collect several different types of information for various purposes to provide and improve our Service to you.
            This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Cookies and Usage Data</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Use of Data</h2>
          <p>
            NexDrak uses the collected data for various purposes:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
            <li>To provide customer care and support</li>
            <li>To provide analysis or valuable information so that we can improve the Service</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us by email: info@nexdrak.com
          </p>
        </div>
      </div>
    </div>
  );
}
