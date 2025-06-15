import calc from "./calc";
import ImportedFile from "./components/ImportedFile";
import { mdiCloudOffOutline, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

function App() {
  const fileInputRef = useRef(null);
  const [allFiles, setAllFiles] = useState([]);
  const onFileChange = async (e) => {
    let files = Array.from(e.target.files);
    for (const file of files) {
      const id = uuidv4();
      setAllFiles((prev) => [
        ...prev,
        {
          id,
          file,
          amount: "1",
          infill: "15",
          walls: "2",
          nozzleDiameter: "0.4",
          density: "1.24",
          pricePerKg: "20",
          loading: true,
        },
      ]);
      const { volume, surfaceArea } = await calc(file);
      setAllFiles((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, loading: false, volume, surfaceArea }
            : entry,
        ),
      );
    }
    fileInputRef.current.value = "";
  };
  const handleFieldChange = (id, field, value) => {
    setAllFiles((prev) =>
      prev.map((entry) =>
        entry.id === id ? { ...entry, [field]: value } : entry,
      ),
    );
  };
  const handleRemoveFile = (id) => {
    setAllFiles((prev) => prev.filter((entry) => entry.id !== id));
  };
  useEffect(() => {
    const readyFiles = allFiles.filter((file) => file.loading === false);
    for (const file of readyFiles) {
      const id = file.id;
      const wallsVolume = file.walls * file.nozzleDiameter * file.surfaceArea;
      const infillVolume = (file.volume - wallsVolume) * (file.infill / 100);
      const weight =
        (file.amount * (file.density * (wallsVolume + infillVolume))) / 1000;
      const price = (file.pricePerKg / 1000) * weight;
      setAllFiles((prev) =>
        prev.map((entry) =>
          entry.id === id
            ? { ...entry, weight: weight.toFixed(2), price: price.toFixed(2) }
            : entry,
        ),
      );
    }
  }, allFiles);
  return (
    <main className="h-[100dvh] px-6 dark:text-white">
      {allFiles.length == 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <h1 className="text-4xl font-semibold">Welcome!</h1>
          <p className="mt-4 text-center text-xl">
            Please import your model files (.stl/.obj/.3mf) using the button in
            the corner
          </p>

          <div className="mt-8 flex flex-row items-center gap-2">
            <Icon color="#22c55e" path={mdiCloudOffOutline} size={0.8} />
            <p className="text-center text-sm">
              This app runs 100% offline, in your browser, your models are never
              sent to any server
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 py-4 lg:grid-cols-2 xl:grid-cols-3">
          {allFiles.map((file) => (
            <ImportedFile
              key={file.id}
              file={file}
              handleFieldChange={handleFieldChange}
              handleRemoveFile={handleRemoveFile}
            />
          ))}
        </div>
      )}
      <input
        className="hidden"
        ref={fileInputRef}
        onChange={onFileChange}
        multiple
        accept=".stl,.obj,.3mf"
        type="file"
      />
      <button
        className="fixed right-4 bottom-4 cursor-pointer rounded-xl bg-blue-500 p-4 transition hover:bg-blue-700"
        onClick={() => fileInputRef.current?.click()}
      >
        <Icon color="#fff" path={mdiPlus} size={1} />
      </button>
    </main>
  );
}

export default App;
