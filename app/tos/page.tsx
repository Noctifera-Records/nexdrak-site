import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | NexDrak",
  description: "Terms of Service for NexDrak.com",
};

export default function TermsOfServicePage() {
  return (
    <div className="container mx-auto px-4 py-24 mt-10 text-foreground">
      <div className="max-w-4xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          
          <h2 className="text-2xl font-bold mt-8 mb-4">1. Agreement to Terms</h2>
          <p>
            By accessing or using our website located at https://nexdrak.com (the "Site"), you agree to be bound by these Terms of Service and our Privacy Policy.
            If you disagree with any part of the terms, then you may not access the Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">2. Intellectual Property</h2>
          <p>
            The Service and its original content (excluding Content provided by users), features and functionality are and will remain the exclusive property of NexDrak and its licensors.
            The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries.
            Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of NexDrak.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">3. User Accounts</h2>
          <p>
            When you create an account with us, you must provide us information that is accurate, complete, and current at all times.
            Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
          </p>
          <p>
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password,
            whether your password is with our Service or a third-party service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">4. Links to Other Web Sites</h2>
          <p>
            Our Service may contain links to third-party web sites or services that are not owned or controlled by NexDrak.
            NexDrak has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party web sites or services.
            You further acknowledge and agree that NexDrak shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">5. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
            Upon termination, your right to use the Service will immediately cease. If you wish to terminate your account, you may simply discontinue using the Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">6. Governing Law</h2>
          <p>
            These Terms shall be governed and construed in accordance with the laws, without regard to its conflict of law provisions.
            Our failure to enforce any right or provision of these Terms will not be considered a waiver of those rights.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">7. Changes</h2>
          <p>
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect.
            What constitutes a material change will be determined at our sole discretion.
          </p>
          <p>
             By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
             If you do not agree to the new terms, please stop using the Service.
          </p>

          <h2 className="text-2xl font-bold mt-8 mb-4">8. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at info@nexdrak.com.
          </p>
        </div>
      </div>
    </div>
  );
}
