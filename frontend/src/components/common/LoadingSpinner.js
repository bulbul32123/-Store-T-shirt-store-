//
const LoadingSpinner = () => {
 
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-6 w-6 rounded-full border-2 border-[#111] border-t-transparent animate-spin" />
      </div>
    );
};

export default LoadingSpinner; 