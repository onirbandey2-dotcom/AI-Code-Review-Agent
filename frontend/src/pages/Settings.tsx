import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ErrorBoundary } from '@/components/features/ErrorBoundary';
import { toast } from '@/hooks/use-toast';
import { useTheme } from '@/hooks/useTheme';
import {
  Bell,
  Shield,
  Eye,
  Globe,
  Palette,
  Webhook,
  Key,
  Save,
  Moon,
  Sun,
} from 'lucide-react';

export function Settings() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    reviewNotifications: true,
    securityAlerts: true,
    weeklyDigest: false,
    autoReview: true,
    showLineNumbers: true,
    minimapEnabled: true,
    tabSize: '2',
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    toast({ title: 'Settings saved successfully', variant: 'success' });
    setIsSaving(false);
  };

  return (
    <div className="page-container max-w-4xl">
      <ErrorBoundary>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and application preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Appearance</CardTitle>
                  <CardDescription>Customize the look and feel of CodeSage AI</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {theme === 'dark' ? (
                    <Moon className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <Sun className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Theme</p>
                    <p className="text-xs text-muted-foreground">
                      Current: {theme === 'dark' ? 'Dark' : 'Light'} mode
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  Toggle {theme === 'dark' ? 'Light' : 'Dark'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>Configure how you receive notifications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                {
                  id: 'emailNotifications',
                  label: 'Email Notifications',
                  description: 'Receive notifications via email',
                  icon: Globe,
                },
                {
                  id: 'reviewNotifications',
                  label: 'Review Notifications',
                  description: 'Get notified when reviews are completed',
                  icon: Eye,
                },
                {
                  id: 'securityAlerts',
                  label: 'Security Alerts',
                  description: 'Immediate alerts for critical security findings',
                  icon: Shield,
                },
                {
                  id: 'weeklyDigest',
                  label: 'Weekly Digest',
                  description: 'Receive a weekly summary of all reviews',
                  icon: Bell,
                },
              ].map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={settings[item.id as keyof typeof settings] as boolean}
                    onCheckedChange={(checked) =>
                      setSettings((prev) => ({ ...prev, [item.id]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Editor Preferences */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Editor</CardTitle>
                  <CardDescription>Code editor preferences</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Show Line Numbers</p>
                  <p className="text-xs text-muted-foreground">Display line numbers in the editor</p>
                </div>
                <Switch
                  checked={settings.showLineNumbers}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, showLineNumbers: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Minimap</p>
                  <p className="text-xs text-muted-foreground">Show code minimap</p>
                </div>
                <Switch
                  checked={settings.minimapEnabled}
                  onCheckedChange={(checked) =>
                    setSettings((prev) => ({ ...prev, minimapEnabled: checked }))
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Tab Size</p>
                  <p className="text-xs text-muted-foreground">Number of spaces per tab</p>
                </div>
                <Input
                  type="number"
                  value={settings.tabSize}
                  onChange={(e) =>
                    setSettings((prev) => ({ ...prev, tabSize: e.target.value }))
                  }
                  className="w-20 h-8 text-sm"
                  min={1}
                  max={8}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </ErrorBoundary>
    </div>
  );
}
