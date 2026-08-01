"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type NetworkStatus = "checking" | "online" | "offline";

type AlarmController = {
  context: AudioContext;
  oscillator: OscillatorNode;
  timerId: number;
};

export function EmergencyShortcut() {
  const [isOpen, setIsOpen] = useState(false);
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>("checking");
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const alarmRef = useRef<AlarmController | null>(null);

  const stopAlarm = useCallback(() => {
    const alarm = alarmRef.current;
    if (!alarm) return;

    window.clearInterval(alarm.timerId);
    try {
      alarm.oscillator.stop();
    } catch {
      // The oscillator may already have stopped during browser cleanup.
    }
    void alarm.context.close();
    alarmRef.current = null;
    setIsAlarmPlaying(false);
  }, []);

  const startAlarm = useCallback(async () => {
    if (alarmRef.current) {
      stopAlarm();
      return;
    }

    const context = new AudioContext();
    await context.resume();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    let highTone = false;

    oscillator.type = "square";
    oscillator.frequency.value = 660;
    gain.gain.value = 0.14;
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start();

    const timerId = window.setInterval(() => {
      highTone = !highTone;
      oscillator.frequency.setValueAtTime(highTone ? 880 : 660, context.currentTime);
    }, 420);

    alarmRef.current = { context, oscillator, timerId };
    setIsAlarmPlaying(true);
  }, [stopAlarm]);

  const closePanel = useCallback(() => {
    stopAlarm();
    setIsOpen(false);
  }, [stopAlarm]);

  useEffect(() => {
    const updateNetworkStatus = () => setNetworkStatus(navigator.onLine ? "online" : "offline");
    updateNetworkStatus();
    window.addEventListener("online", updateNetworkStatus);
    window.addEventListener("offline", updateNetworkStatus);

    return () => {
      window.removeEventListener("online", updateNetworkStatus);
      window.removeEventListener("offline", updateNetworkStatus);
      const alarm = alarmRef.current;
      if (alarm) {
        window.clearInterval(alarm.timerId);
        try {
          alarm.oscillator.stop();
        } catch {
          // The browser may already have released the audio device.
        }
        void alarm.context.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePanel();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closePanel, isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-40 min-h-14 rounded-full border-2 border-white bg-coral px-5 py-3 text-base font-bold text-white shadow-[0_10px_32px_rgba(16,44,61,0.28)] transition hover:bg-[#99443a]"
      >
        <span aria-hidden="true">!</span> ฉุกเฉิน
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-[#102c3de8] p-4" role="presentation">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="emergency-shortcut-title"
            className="my-4 w-full max-w-2xl border-t-8 border-coral bg-white p-5 shadow-[12px_12px_0_#f1b84b] sm:p-8"
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-xs font-bold tracking-[0.14em] text-coral">ความปลอดภัยมาก่อน</p>
                <h2 id="emergency-shortcut-title" className="mt-2 text-3xl font-bold leading-10 text-ink">
                  ขอความช่วยเหลือฉุกเฉิน
                </h2>
              </div>
              <button type="button" onClick={closePanel} aria-label="ปิดหน้าฉุกเฉิน" className="grid h-11 w-11 shrink-0 place-items-center border border-line text-2xl text-ink">
                ×
              </button>
            </div>

            <p className="mt-4 border-l-4 border-saffron bg-[#fff8e8] p-4 text-sm leading-6 text-ink">
              เว็บตรวจได้เฉพาะการเชื่อมต่ออินเทอร์เน็ต ไม่สามารถตรวจว่ามือถือมีสัญญาณโทรศัพท์หรือไม่
              ปุ่มโทรจะเปิดแอปโทรศัพท์พร้อมหมายเลข แล้วให้คุณกดยืนยันการโทรอีกครั้ง
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className={`h-3 w-3 rounded-full ${networkStatus === "offline" ? "bg-coral" : networkStatus === "online" ? "bg-river" : "bg-saffron"}`} aria-hidden="true" />
              <strong className="text-ink">
                {networkStatus === "offline" ? "อินเทอร์เน็ตขาดหาย — คู่มือนี้ยังเปิดได้" : networkStatus === "online" ? "อินเทอร์เน็ตเชื่อมต่ออยู่" : "กำลังตรวจการเชื่อมต่อ"}
              </strong>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <a href="tel:191" aria-label="โทร 191 เหตุด่วนเหตุร้าย เปิดหน้าจอโทรศัพท์พร้อมหมายเลข" data-testid="call-police" className="flex min-h-20 flex-col items-center justify-center bg-coral px-5 py-4 text-center text-xl font-bold text-white no-underline">
                ☎ โทร 191<span className="mt-1 text-sm font-semibold">เหตุด่วนเหตุร้าย</span>
              </a>
              <a href="tel:1669" aria-label="โทร 1669 การแพทย์ฉุกเฉิน เปิดหน้าจอโทรศัพท์พร้อมหมายเลข" data-testid="call-ems" className="flex min-h-20 flex-col items-center justify-center bg-river px-5 py-4 text-center text-xl font-bold text-white no-underline">
                ☎ โทร 1669<span className="mt-1 text-sm font-semibold">การแพทย์ฉุกเฉิน</span>
              </a>
            </div>

            <div className="mt-6 border border-line bg-paper p-5">
              <h3 className="text-lg font-bold text-ink">ถ้าโทรไม่สำเร็จเพราะไม่มีเครือข่าย</h3>
              <ol className="mt-3 grid gap-2 pl-5 text-sm leading-6 text-ink-soft">
                <li>ออกจากจุดเสี่ยง ไปยังที่ที่มีคน แสงสว่าง หรือเจ้าหน้าที่ หากทำได้อย่างปลอดภัย</li>
                <li>ลองใช้ฟังก์ชัน SOS หรือ SOS ผ่านดาวเทียมของโทรศัพท์ หากอุปกรณ์และพื้นที่รองรับ เว็บไม่สามารถเปิดบริการดาวเทียมแทนโทรศัพท์ได้</li>
                <li>ใช้เสียงเตือนด้านล่างเพื่อเรียกคนใกล้เคียง เฉพาะเมื่อไม่ทำให้ผู้ก่อเหตุพบตำแหน่งของคุณ</li>
              </ol>
              <button
                type="button"
                onClick={() => void startAlarm()}
                aria-pressed={isAlarmPlaying}
                className={`mt-5 min-h-12 w-full border px-5 py-3 font-bold ${isAlarmPlaying ? "border-coral bg-coral text-white" : "border-ink bg-white text-ink"}`}
              >
                {isAlarmPlaying ? "หยุดเสียงเตือน" : "ส่งเสียงเตือนจากเครื่อง"}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}
