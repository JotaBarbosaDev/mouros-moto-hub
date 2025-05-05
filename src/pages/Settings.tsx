
import { MembersLayout } from '@/components/layouts/MembersLayout';
import { SystemSettingsForm } from '@/components/settings/SystemSettingsForm';

const Settings = () => {
  return (
    <MembersLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-display text-mouro-black mb-8">
          Configurações do <span className="text-mouro-red">Sistema</span>
        </h1>
        
        <div className="grid grid-cols-1 gap-8">
          <SystemSettingsForm />
        </div>
      </div>
    </MembersLayout>
  );
};

export default Settings;
