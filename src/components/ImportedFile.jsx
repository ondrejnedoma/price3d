import Input from "./Input";
import Menu from "./Menu";
import { mdiCancel, mdiClose, mdiLoading } from "@mdi/js";
import Icon from "@mdi/react";
import { motion } from "framer-motion";
import React, { useState } from "react";

export default function ImportedFile({
  file,
  handleFieldChange,
  handleRemoveFile,
}) {
  const formatNumberWithSpaces = (num) => {
    const [integerPart, decimalPart] = num.toString().split(".");
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    return decimalPart
      ? `${formattedInteger}.${decimalPart}`
      : formattedInteger;
  };
  const [densityPreset, setDensityPreset] = useState("PLA - 1.24");
  const [customDensityEnabled, setCustomDensityEnabled] = useState(false);
  const handleDensityMenuChange = (chosenDensityPreset) => {
    setDensityPreset(chosenDensityPreset);
    if (!chosenDensityPreset.startsWith("Custom")) {
      handleFieldChange(
        file.id,
        "density",
        chosenDensityPreset.split(" - ")[1],
      );
      setCustomDensityEnabled(false);
    } else {
      handleFieldChange(file.id, "density", "1.00");
      setCustomDensityEnabled(true);
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      layout
      className="w-full rounded-xl bg-neutral-50 px-4 py-2 ring ring-neutral-300 dark:bg-neutral-900 dark:ring-neutral-700"
    >
      <div className="flex flex-row items-center justify-between gap-2">
        <h2 className="truncate text-2xl font-medium">{file.file.name}</h2>
        <div
          className="cursor-pointer transition hover:text-neutral-400"
          onClick={() => handleRemoveFile(file.id)}
        >
          <Icon size={1} path={mdiClose} />
        </div>
      </div>
      {file.loading ? (
        <Icon spin size={2} path={mdiLoading} />
      ) : (
        <>
          <img className="mx-auto w-40" src={file.previewImage} />
          <div className="flex flex-col gap-3">
            <Input
              type="number"
              value={file.amount}
              onChange={(e) =>
                handleFieldChange(file.id, "amount", e.target.value)
              }
              min={1}
            >
              Amount
            </Input>
            <Input
              type="number"
              value={file.infill}
              onChange={(e) =>
                handleFieldChange(file.id, "infill", e.target.value)
              }
              min={0}
              max={100}
            >
              Infill (%)
            </Input>
            <Input
              type="number"
              value={file.walls}
              onChange={(e) =>
                handleFieldChange(file.id, "walls", e.target.value)
              }
              min={0}
            >
              Walls
            </Input>
            {file.walls > 0 ? (
              <Input
                type="number"
                value={file.nozzleDiameter}
                onChange={(e) =>
                  handleFieldChange(file.id, "nozzleDiameter", e.target.value)
                }
                min={0}
                step={0.1}
              >
                Nozzle diameter (mm)
              </Input>
            ) : null}
            <Menu
              value={densityPreset}
              onChange={handleDensityMenuChange}
              options={[
                "Custom (eg. resins)",
                "PLA - 1.24",
                "PETG - 1.27",
                "ABS - 1.04",
                "ASA - 1.05",
                "TPU - 1.21",
                "Nylon - 1.52",
                "Polycarbonate - 1.3",
              ]}
            >
              Density (g/cm³)
            </Menu>
            {customDensityEnabled ? (
              <Input
                type="number"
                value={file.density}
                onChange={(e) =>
                  handleFieldChange(file.id, "density", e.target.value)
                }
                min={0}
                step={0.01}
              >
                Custom density (g/cm³)
              </Input>
            ) : null}
            <Input
              type="number"
              value={file.pricePerKg}
              onChange={(e) =>
                handleFieldChange(file.id, "pricePerKg", e.target.value)
              }
              min={0}
            >
              Price (per kg)
            </Input>
          </div>
          <div className="mt-6">
            <div className="flex flex-row items-center justify-between">
              <p className="text-xl">Weight</p>
              <p className="text-right text-2xl font-semibold text-blue-500">
                {file.weight}g
              </p>
            </div>
            <div className="flex flex-row items-center justify-between">
              <p className="text-xl">Price</p>
              <p className="text-right text-2xl font-semibold text-blue-500">
                {file.price}
              </p>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
