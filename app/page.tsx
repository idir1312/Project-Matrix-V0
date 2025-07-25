'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs.tsx';
import { Slider } from '@/components/ui/slider.tsx';
import { Switch } from '@/components/ui/switch.tsx';
import { Card } from '@/components/ui/card.tsx';
import { useTheme } from 'next-themes';
import Map from '@/components/Map.tsx';
import useStore from '@/lib/store.ts';

export default function Home() {
  const { activeDomain, setActiveDomain, selectedYear, setSelectedYear } = useStore();
  const { setTheme } = useTheme();

  return (
    <div className="flex h-screen">
      <aside className="w-64 p-4">
        <Tabs value={activeDomain} onValueChange={setActiveDomain}>
          <TabsList>
            <TabsTrigger value="economy">Economy</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          </TabsList>
        </Tabs>
        <Slider
          min={2010}
          max={2023}
          value={[selectedYear]}
          onValueChange={([val]) => setSelectedYear(val)}
          className="my-4"
        />
        <Switch onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} /> Dark Mode
        <Card className="mt-4">Detail Panel (Click map)</Card>
      </aside>
      <main className="flex-1">
        <Map />
      </main>
    </div>
  );
}
