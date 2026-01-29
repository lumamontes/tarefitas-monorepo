import { createFileRoute } from "@tanstack/react-router";
import { OnboardingNameForm } from "../../components/onboarding/OnboardingNameForm";

export const Route = createFileRoute("/onboarding/nome")({
  component: OnboardingNameForm,
});
