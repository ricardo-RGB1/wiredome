const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      {children}
    </div>
  )
};

export default AuthLayout;