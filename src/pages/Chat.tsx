import { KIChatInterface } from '@/components/KIChatInterface';

export default function Chat() {
  return (
    <div className="h-screen w-full overflow-hidden">
      <KIChatInterface mode="balanced" />
    </div>
  );
}
