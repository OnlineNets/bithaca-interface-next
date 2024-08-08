// Layout
import Main from "@/UI/layouts/Main/Main";
import Container from "@/UI/layouts/Container/Container";

// Components
import Meta from "@/UI/components/Meta/Meta";

const Privacy = () => {
  return (
    <>
      <Meta />
      <Main>
        <Container>
          <h1 className='mb-20 mt-10' style={{ fontSize: "24px" }}>
            Privacy Policy
          </h1>
          <h5 className='mb-20'>Updated 01Dec23</h5>
          <h1>Personal Information We Collect</h1>
          <h1>Overview</h1>
          <h4 style={{ fontWeight: "normal", lineHeight: "1.5rem" }}>
            Personal information typically means information that identifies or is reasonably capable of identifying an
            individual, directly or indirectly, and information that relates to, describes, is reasonably capable of
            being associated with or could reasonably be linked to an identified or reasonably identifiable individual.
            For the purposes of this Privacy Policy, only the definition of personal information from the applicable law
            of your legal residence will apply to you and be deemed your “Personal Information.”A.Personal Information
            we collect from you
          </h4>
          <h4 style={{ fontWeight: "normal", lineHeight: "1.5rem", marginBottom: -15, marginTop: 15 }}>
            We may collect the following categories of Personal Information directly from you:
          </h4>
          <ul>
            <li>
              Identification Information, such as name, email, phone number, postal address, and/or government-issued
              identity documents;
            </li>
            <li>
              Commercial Information, such as trading activity, order activity, deposits, withdrawals, account balances;
            </li>
            <li>Financial Information, such as bank account information, routing number;</li>
            <li>
              Correspondence, such as information that you provide to us in correspondence, including account opening
              and customer support
            </li>
            <li>
              {" "}
              Audio, Electronic, Visual, Thermal, Olfactory, or Similar Information, such as images and videos collected
              for identity verification, audio recordings left on answering machines;{" "}
            </li>
            <li>Biometric Information, such as scans of your face geometry extracted from identity documents;</li>
            <li>Professional or Employment-related Information, such as job title, source of wealth; and </li>
            <li>
              Institutional Information, such as for institutional customers, we may collect additional information,
              including: institution’s legal name, Employer Identification Number (“EIN”) or any comparable
              identification number issued by a government, and proof of legal existence (which may include articles of
              incorporation, certificate of formation, business license, trust instrument, or other comparable legal
              document).
            </li>
            <li>
              Sensitive Personal Information, such as government-issued identification numbers (which may include Social
              Security Number or equivalent, driver’s license number, passport number).
            </li>
          </ul>
        </Container>
      </Main>
    </>
  );
};

export default Privacy;
