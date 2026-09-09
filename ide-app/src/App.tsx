import IDELayout from "./components/IDELayout";
import "./App.css";
// main end point 
function App() {
  return (
    <div className="h-screen w-screen overflow-hidden flex flex-col">
      <IDELayout />
    </div>
  );
}

export default App;
