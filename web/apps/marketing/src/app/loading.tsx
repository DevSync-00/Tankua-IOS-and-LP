export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#F8F6F0] to-white">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#F4C430] flex items-center justify-center shadow-lg">
          <span className="text-white font-bold text-2xl">T</span>
        </div>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A017] mx-auto"></div>
        <p className="mt-4 text-[#0A1A2F]/60">Loading...</p>
      </div>
    </div>
  );
}
