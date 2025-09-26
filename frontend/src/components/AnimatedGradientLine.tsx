const AnimatedGradientLine = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-1 overflow-hidden z-10">
      <div 
        className="h-full w-32 bg-gradient-line animate-gradient-flow"
        style={{
          background: 'var(--gradient-line)',
        }}
      />
    </div>
  );
};

export default AnimatedGradientLine;