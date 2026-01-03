js
import { useEffect } from "react";

function App() {
  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => console.log(data));
  }, []);

  return <h1>React + Node + MySQL</h1>;
}

export default App;