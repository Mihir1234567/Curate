import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Button } from "../components/ui/Button";

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type?: "danger" | "primary";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [modal, setModal] = useState<{
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  } | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setModal({ options, resolve });
    });
  }, []);

  const handleClose = (value: boolean) => {
    if (modal) {
      modal.resolve(value);
      setModal(null);
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {modal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-up">
            <div className="p-6">
              <h3 className="text-xl font-bold text-neutral-dark mb-2">
                {modal.options.title || "Confirm Action"}
              </h3>
              <p className="text-gray-500">{modal.options.message}</p>
            </div>
            <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
              <Button variant="ghost" onClick={() => handleClose(false)}>
                {modal.options.cancelLabel || "Cancel"}
              </Button>
              <Button
                variant={
                  modal.options.type === "danger" ? "outline" : "primary"
                }
                onClick={() => handleClose(true)}
                className={
                  modal.options.type === "danger"
                    ? "border-red-500 text-red-500 hover:bg-red-50"
                    : ""
                }
              >
                {modal.options.confirmLabel || "Confirm"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error("useConfirm must be used within a ConfirmProvider");
  }
  return context;
};
