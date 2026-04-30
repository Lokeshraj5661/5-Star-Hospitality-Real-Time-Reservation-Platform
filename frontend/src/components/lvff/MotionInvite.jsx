import { AnimatePresence, motion } from "framer-motion";
import { useMotion } from "@/context/MotionContext";

export default function MotionInvite() {
  const { needsPrompt, requestPermission, dismiss, haptics } = useMotion();

  return (
    <AnimatePresence>
      {needsPrompt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-6"
          data-testid="motion-invite"
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
            className="gold-frame max-w-sm w-full p-8 md:p-10 bg-[var(--lvff-bg)] flex flex-col gap-6 text-center"
          >
            <span className="text-[10px] tracking-luxe uppercase text-[var(--lvff-gold)]">
              An Invitation
            </span>
            <h3 className="font-serif text-3xl text-[var(--lvff-cream-soft)] leading-tight">
              Experience the <span className="italic engraved">Sanctuary</span> in motion.
            </h3>
            <p className="text-sm text-[var(--lvff-cream)]/65 leading-relaxed">
              Allow gentle access to your device's motion sensors and our shrine, plates and
              lanterns will tilt with you — as if held in your own hands.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <button
                onClick={() => {
                  haptics.light();
                  requestPermission();
                }}
                className="btn-lux btn-lux-solid justify-center"
                data-testid="motion-invite-allow"
              >
                Allow Motion Access
              </button>
              <button
                onClick={dismiss}
                className="text-[10px] tracking-luxe uppercase text-[var(--lvff-cream)]/45 hover:text-[var(--lvff-gold)] transition-colors"
                data-testid="motion-invite-dismiss"
              >
                Not Today
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
