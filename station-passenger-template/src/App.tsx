import { TemplateList } from './components/TemplateList'
import './index.css'

function App() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <header className="bg-white border-b border-[#E5E7EB] px-6 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <h1 className="text-[18px] font-bold text-[#111827]">客运模板管理</h1>
          <span className="text-[12px] text-[#9CA3AF] font-medium">Passenger Template Manager</span>
        </div>
        <div className="flex items-center gap-5 text-[12px] text-[#6B7280]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF4D4F]" /> 未同步
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#1890FF]" /> 待下发
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#D1D5DB]" /> 已完成
          </span>
        </div>
      </header>
      <main className="w-full">
        <TemplateList />
      </main>
    </div>
  )
}

export default App
