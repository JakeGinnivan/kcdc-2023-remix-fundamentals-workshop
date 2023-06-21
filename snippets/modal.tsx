import { Link, useNavigate } from "@remix-run/react";
import type { PropsWithChildren, ReactNode } from "react";

function ClosableBackground({
  closeLink,
  onClose,
  children,
}: PropsWithChildren<{
  onClose?: () => void;
  closeLink?: string;
}>) {
  const navigate = useNavigate();
  return (
    <div
      tabIndex={-1}
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-full max-h-full justify-center items-center flex bg-gray-600 bg-opacity-70"
      onClick={(e) => {
        if (e.target !== e.currentTarget) {
          return;
        }

        if (onClose) {
          onClose();
        } else if (closeLink) {
          navigate(closeLink);
        }
      }}
    >
      {children}
    </div>
  );
}

export function Modal({
  header,
  children,
  footer,
  onClose,
  closeLink,
}: PropsWithChildren<{
  header?: ReactNode;
  footer?: ReactNode;
  onClose?: () => void;
  closeLink?: string;
}>) {
  return (
    <ClosableBackground closeLink={closeLink} onClose={onClose}>
      <div className="relative w-full max-w-2xl max-h-full">
        {/* Content */}
        <div className="relative bg-white rounded-lg shadow">
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b rounded-t ">
            {typeof header === "string" ? (
              <h3 className="text-xl font-semibold text-gray-900">{header}</h3>
            ) : (
              header
            )}
            {closeLink ? (
              <Link
                to={closeLink}
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </Link>
            ) : null}
            {onClose ? (
              <button
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                onClick={onClose}
              >
                <svg
                  aria-hidden="true"
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            ) : null}
          </div>
          {/* Body */}
          <div className="p-6 space-y-6">{children}</div>
          {/* Footer */}
          {footer ? (
            <div className="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </ClosableBackground>
  );
}
