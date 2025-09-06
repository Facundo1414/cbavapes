
"use client";
import { useRouter } from "next/navigation";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function PageHeader({ title }: { title: string }) {
  const router = useRouter();
    return (
        <>
            <header className="border-b px-4 py-3 flex items-center gap-3 w-full max-w-none">
                <Button variant="ghost" size="icon" onClick={() => router.back()} aria-label="Volver">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </Button>
                <h1 className="text-lg md:text-2xl font-semibold text-neutral-900 text-center flex-1" style={{ letterSpacing: '-0.01em' }}>{title}</h1>
                <div className="w-8 h-8" />
            </header>
            <Separator className="my-2" />
        </>
    );
}
