import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
  Hr,
  Button,
} from "@react-email/components";
import * as React from "react";

export interface InvitationProps {
  clientName: string;
  projectName: string;
  message: string;
  loginEmail: string;
  loginPassword: string;
  loginLink: string;
}

export const ClientInvitation: React.FC<Readonly<InvitationProps>> = ({
  clientName,
  projectName,
  message,
  loginEmail,
  loginPassword,
  loginLink,
}) => (
  <Html>
    <Head />
    <Preview>Invitation to collaborate on {projectName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Project Collaboration Invitation</Heading>
        <Text style={text}>Hello {clientName},</Text>
        <Text style={text}>
          You've been invited to collaborate on the project:{" "}
          <strong>{projectName}</strong>
        </Text>
        <Text style={text}>{message}</Text>
        <Section style={loginSection}>
          <Heading as="h2" style={h2}>
            Login Details
          </Heading>
          <Text style={loginText}>
            Email: <strong>{loginEmail}</strong>
          </Text>
          <Text style={loginText}>
            Password: <strong>{loginPassword}</strong>
          </Text>
          <Button style={buttonStyle} href={loginLink}>
            Login to Project
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          Please keep these login details secure. We recommend changing your
          password after your first login.
        </Text>
      </Container>
    </Body>
  </Html>
);

export default ClientInvitation;

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};
const buttonStyle = {
  backgroundColor: "#007bff",
  borderRadius: "4px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  marginTop: "16px",
  padding: "10px 20px",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
};

const h1 = {
  color: "#333",
  fontSize: "24px",
  fontWeight: "bold",
  paddingTop: "32px",
  paddingBottom: "16px",
};

const h2 = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  paddingTop: "16px",
  paddingBottom: "8px",
};

const text = {
  color: "#333",
  fontSize: "16px",
  lineHeight: "24px",
  paddingBottom: "8px",
};

const loginSection = {
  backgroundColor: "#f4f4f4",
  borderRadius: "4px",
  padding: "24px",
  marginTop: "16px",
  marginBottom: "16px",
};

const loginText = {
  color: "#333",
  fontSize: "14px",
  lineHeight: "24px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#898989",
  fontSize: "12px",
  lineHeight: "20px",
};
