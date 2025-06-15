import calc from "./calc";
import ImportedFile from "./components/ImportedFile";
import { mdiCloudOffOutline, mdiPlus } from "@mdi/js";
import Icon from "@mdi/react";
import { AnimatePresence, motion } from "framer-motion";
import Lenis from "lenis";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
      smoothWheel: true,
    });

    const raf = (time) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);
  const fileInputRef = useRef(null);
  const [allFiles, setAllFiles] = useState([]);
  const onFileChange = async (e) => {
    let files = Array.from(e.target.files);
    const filesToAdd = files.map((file) => ({
      id: uuidv4(),
      file,
      amount: "1",
      infill: "15",
      walls: "2",
      nozzleDiameter: "0.4",
      density: "1.24",
      pricePerKg: "20",
      loading: true,
    }));
    setAllFiles((prev) => [...prev, ...filesToAdd]);
    for (const file of filesToAdd) {
      const { volume, surfaceArea, previewImage } = await calc(file.file);
      console.log(previewImage);
      setAllFiles((prev) =>
        prev.map((entry) =>
          entry.id === file.id
            ? { ...entry, loading: false, volume, surfaceArea, previewImage }
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
    const updatedFiles = allFiles.map((file) => {
      if (!file.loading) {
        let weight, price;
        const wallsVolume = file.walls * file.nozzleDiameter * file.surfaceArea;
        if (wallsVolume > file.volume) {
          // The object's wallsVolume is larger than its total volume, so ignore the wallsVolume and assume 100% infill
          weight = (file.amount * file.density * file.volume) / 1000;
        } else {
          const infillVolume =
            (file.volume - wallsVolume) * (file.infill / 100);
          weight =
            (file.amount * (file.density * (wallsVolume + infillVolume))) /
            1000;
        }
        price = (file.pricePerKg / 1000) * weight;

        return {
          ...file,
          weight: weight.toFixed(2),
          price: price.toFixed(2),
        };
      }
      return file;
    });

    setAllFiles(updatedFiles);
  }, [
    JSON.stringify(
      allFiles.map(
        ({
          id,
          amount,
          infill,
          walls,
          nozzleDiameter,
          density,
          pricePerKg,
          volume,
          surfaceArea,
          loading,
        }) => ({
          id,
          amount,
          infill,
          walls,
          nozzleDiameter,
          density,
          pricePerKg,
          volume,
          surfaceArea,
          loading,
        }),
      ),
    ),
  ]);
  return (
    <main className="h-[100dvh] px-6 dark:text-white">
      <AnimatePresence mode="wait">
        {allFiles.length == 0 ? (
          <motion.div
            key="home"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex h-full flex-col items-center justify-center"
          >
            <h1 className="text-4xl font-semibold">Welcome to Price3D!</h1>
            <p className="mt-4 text-center text-xl">
              Please import your model files (.stl/.obj/.3mf) using the button
              in the corner
            </p>

            <div className="mt-8 flex flex-row items-center gap-2">
              <div className="w-5">
                <Icon color="#22c55e" path={mdiCloudOffOutline} size={0.8} />
              </div>
              <p className="text-center text-sm">
                This app runs fully offline, in your browser, your model files
                never leave your device
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="files"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 py-4 lg:grid-cols-2 xl:grid-cols-3"
          >
            <AnimatePresence>
              {allFiles.map((file) => (
                <ImportedFile
                  key={file.id}
                  file={file}
                  handleFieldChange={handleFieldChange}
                  handleRemoveFile={handleRemoveFile}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
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
