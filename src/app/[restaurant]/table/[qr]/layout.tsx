export default function TableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] to-[#FAEBD7]">
      {children}
    </div>
  )
}
