import { Toaster } from 'react-hot-toast';

const CustomToaster = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      toastOptions={{
        className: 'bg-surface text-highlight',
        style: {
          fontSize: '0.875rem',
          borderRadius: '0.375rem',
          marginTop: '50px',
        },
      }}
    />
  );
};

export default CustomToaster;
