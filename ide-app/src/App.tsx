import IDELayout from "./components/IDELayout";
import "./App.css";

function App() {
  return (
    <div className="h-screen w-screen bg-[#1e1e1e] overflow-hidden flex flex-col text-slate-100">
      <IDELayout />
    </div>
  );
}

export default App;
