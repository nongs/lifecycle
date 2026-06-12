"use client";

import { useRef, useState } from "react";
import { ImportDataModal } from "@/components/settings/ImportDataModal";
import { SettingsRow } from "@/components/settings/SettingsRow";
import { SettingsSection } from "@/components/settings/SettingsSection";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useData } from "@/contexts/DataContext";
import type { DataMode } from "@/lib/api";
import {
  buildExportBundle,
  copyExportToClipboard,
  downloadExportFile,
  importDataset,
  parseImportJson,
  readDatasetForExport,
  readFileAsText,
  serializeExportBundle,
} from "@/lib/data/datasetIO";

type Props = {
  dataMode: DataMode;
};

export function DataTransferSection({ dataMode }: Props) {
  const { categories, items, archivedItems, logs, refresh } = useData();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [pendingFileJson, setPendingFileJson] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const targetLabel = dataMode === "cloud" ? "클라우드" : "이 기기(로컬)";

  const buildExportJson = () => {
    const dataset = readDatasetForExport(
      categories,
      items,
      archivedItems,
      logs,
      dataMode
    );
    return serializeExportBundle(buildExportBundle(dataset));
  };

  const handleExportFile = () => {
    setError(null);
    setMessage(null);
    try {
      downloadExportFile(buildExportJson());
      setMessage("JSON 파일을 저장했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "보내기에 실패했습니다.");
    }
  };

  const handleExportClipboard = async () => {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await copyExportToClipboard(buildExportJson());
      setMessage("JSON을 클립보드에 복사했습니다.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "복사에 실패했습니다.");
    } finally {
      setBusy(false);
    }
  };

  const applyImport = async (raw: string) => {
    const dataset = parseImportJson(raw);
    await importDataset(dataset, dataMode);
    await refresh();
    setMessage(`${targetLabel} 데이터를 가져왔습니다.`);
    setPendingFileJson(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError(null);
    setMessage(null);
    try {
      const text = await readFileAsText(file);
      parseImportJson(text);
      setPendingFileJson(text);
    } catch (err) {
      setError(err instanceof Error ? err.message : "파일을 읽을 수 없습니다.");
    }
  };

  return (
    <>
      <SettingsSection title="데이터">
        <SettingsRow
          label="보내기 (파일)"
          description="카테고리·항목·기록을 JSON 파일로 저장"
        >
          <Button variant="secondary" onClick={handleExportFile}>
            저장
          </Button>
        </SettingsRow>
        <SettingsRow
          label="보내기 (코드)"
          description="JSON을 클립보드에 복사해 공유·백업"
        >
          <Button
            variant="secondary"
            disabled={busy}
            onClick={() => void handleExportClipboard()}
          >
            복사
          </Button>
        </SettingsRow>
        <SettingsRow
          label="가져오기 (파일)"
          description={`JSON 파일로 ${targetLabel} 데이터 덮어쓰기`}
        >
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
          >
            선택
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={(e) => void handleFileChange(e)}
          />
        </SettingsRow>
        <SettingsRow
          label="가져오기 (붙여넣기)"
          description="JSON 텍스트를 붙여넣어 덮어쓰기"
          last
        >
          <Button variant="secondary" onClick={() => setImportModalOpen(true)}>
            붙여넣기
          </Button>
        </SettingsRow>
      </SettingsSection>

      {(message || error) && (
        <p
          className={`mb-4 px-1 text-sm ${error ? "text-danger" : "text-ink-muted"}`}
        >
          {error ?? message}
        </p>
      )}

      <ImportDataModal
        open={importModalOpen}
        dataMode={dataMode}
        onClose={() => setImportModalOpen(false)}
        onImport={applyImport}
      />

      <ConfirmDialog
        open={pendingFileJson !== null}
        title="파일에서 가져오기"
        message={`선택한 파일로 ${targetLabel} 데이터를 모두 덮어씁니다. 계속할까요?`}
        confirmLabel="덮어쓰기"
        destructive
        onCancel={() => setPendingFileJson(null)}
        onConfirm={async () => {
          if (!pendingFileJson) return;
          setBusy(true);
          setError(null);
          try {
            await applyImport(pendingFileJson);
          } catch (err) {
            setError(
              err instanceof Error ? err.message : "가져오기에 실패했습니다."
            );
            setPendingFileJson(null);
          } finally {
            setBusy(false);
          }
        }}
      />
    </>
  );
}
