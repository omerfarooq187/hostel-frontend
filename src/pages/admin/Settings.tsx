import ChangePasswordSection from "./settings_sections/ChangePasswordSection";
import FeeConfigSection from "./settings_sections/FeeConfigSection";


export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>
      <ChangePasswordSection />
      <FeeConfigSection />
    </div>
  );
}
