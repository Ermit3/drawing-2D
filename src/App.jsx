import "./App.css";
import Canvas from "./components/Canvas";
import { CurrentShapeProvider } from "./components/Global";

function App() {
  return (
    <div className="container-fluid">
      <CurrentShapeProvider>
        <Canvas width={750} height={500} />
      </CurrentShapeProvider>
    </div>
  );
}

export default App;
