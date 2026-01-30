/**
 * DataSection Component
 * Export/Import backup (JSON) and reset. Uses BackupService + SQLite.
 */

import { useState } from 'react';
import { useTasks } from '../../../hooks/useTasks';
import { useAllSubtasks } from '../../../hooks/useSubtasks';
import { useSettingsStore } from '../../../stores/settingsStore';
import { exportBackup, importBackup, resetAllData } from '../../../backup/BackupService';
import { resetSettings } from '../../../stores/settingsStore';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';

export function DataSection() {
  const { tasks } = useTasks();
  const { subtasks } = useAllSubtasks();
  const themeId = useSettingsStore((s) => s.themeId);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importModeOpen, setImportModeOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [importError, setImportError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const handleExport = async () => {
    setExportStatus('loading');
    const result = await exportBackup();
    if (result.ok) {
      setExportStatus('ok');
      setTimeout(() => setExportStatus('idle'), 2000);
    } else {
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImportChooseMode = () => {
    setImportModeOpen(true);
    setImportError(null);
    setImportStatus('idle');
  };

  const handleImportConfirm = async (mode: 'replace' | 'merge') => {
    setImportModeOpen(false);
    setImportStatus('loading');
    setImportError(null);
    const result = await importBackup(mode);
    if (result.ok) {
      setImportStatus('ok');
      setTimeout(() => setImportStatus('idle'), 2000);
    } else {
      setImportError(result.error);
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 4000);
    }
  };

  const handleReset = async () => {
    if (!showResetConfirm) {
      setShowResetConfirm(true);
      setTimeout(() => setShowResetConfirm(false), 10000);
      return;
    }
    setResetStatus('loading');
    resetSettings();
    const result = await resetAllData();
    if (result.ok) {
      setResetStatus('ok');
      setShowResetConfirm(false);
      window.location.reload();
    } else {
      setResetStatus('error');
      setTimeout(() => setResetStatus('idle'), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Overview */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Visão Geral dos Dados</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card padding="sm" variant="sidebar">
            <div className="text-2xl font-semibold text-theme-text">{tasks.length}</div>
            <div className="text-sm text-theme-muted">Tarefas</div>
          </Card>
          <Card padding="sm" variant="sidebar">
            <div className="text-2xl font-semibold text-theme-text">{subtasks.length}</div>
            <div className="text-sm text-theme-muted">Subtarefas</div>
          </Card>
          <Card padding="sm" variant="sidebar">
            <div className="text-2xl font-semibold text-theme-text">{themeId}</div>
            <div className="text-sm text-theme-muted">Tema Atual</div>
          </Card>
        </div>
      </div>

      {/* Export Data */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Exportar Dados</h3>
        <Card padding="md" variant="sidebar">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-theme-text mb-2">Fazer backup dos seus dados</div>
              <div className="text-sm text-theme-muted mb-4">
                Salva todas as suas tarefas, subtarefas e preferências em um arquivo JSON. Escolha onde salvar.
              </div>
              <Button
                onClick={handleExport}
                variant="primary"
                className="bg-green-600 hover:bg-green-700"
                disabled={exportStatus === 'loading'}
              >
                {exportStatus === 'loading' ? 'Exportando…' : exportStatus === 'ok' ? 'Exportado' : 'Exportar dados'}
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Import Data */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Importar Dados</h3>
        <Card padding="md" variant="sidebar">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 11-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-theme-text mb-2">Restaurar backup</div>
              <div className="text-sm text-theme-muted mb-4">
                Escolha um arquivo de backup e depois selecione: substituir tudo ou mesclar com os dados atuais.
              </div>
              <Button
                onClick={handleImportChooseMode}
                variant="primary"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={importStatus === 'loading'}
              >
                {importStatus === 'loading' ? 'Importando…' : importStatus === 'ok' ? 'Importado' : 'Importar dados'}
              </Button>
              {importError && (
                <p className="text-sm text-red-600 mt-2">{importError}</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Import mode modal */}
      {importModeOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="import-mode-title"
        >
          <div className="bg-theme-panel border border-theme-border rounded-2xl shadow-xl max-w-md w-full p-6">
            <h2 id="import-mode-title" className="text-lg font-semibold text-theme-text mb-2">
              Como importar?
            </h2>
            <p className="text-sm text-theme-muted mb-4">
              Escolha o modo de importação. Em seguida, um seletor de arquivo será aberto.
            </p>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() => handleImportConfirm('replace')}
                variant="primary"
                className="w-full"
              >
                Substituir tudo
              </Button>
              <Button
                onClick={() => handleImportConfirm('merge')}
                variant="secondary"
                className="w-full"
              >
                Mesclar (manter o mais recente por id)
              </Button>
              <Button
                onClick={() => setImportModeOpen(false)}
                variant="secondary"
                className="w-full"
              >
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset to Defaults */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Restaurar Padrões</h3>
        <Card padding="md" variant="sidebar" className="border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div className="flex-1">
              <div className="font-medium text-red-800 mb-2">Apagar todos os dados</div>
              <div className="text-sm text-red-700 mb-4">
                Remove todas as tarefas, subtarefas e preferências. Esta ação não pode ser desfeita. Faça um backup antes se precisar.
              </div>
              <Button
                onClick={handleReset}
                variant={showResetConfirm ? 'primary' : 'secondary'}
                className={
                  showResetConfirm
                    ? 'bg-red-700 hover:bg-red-800 text-white'
                    : 'bg-red-100 text-red-700 hover:bg-red-200'
                }
                disabled={resetStatus === 'loading'}
              >
                {resetStatus === 'loading' ? 'Limpando…' : showResetConfirm ? 'Confirmar' : 'Restaurar padrões'}
              </Button>
              {showResetConfirm && (
                <p className="text-xs text-red-600 mt-2">
                  Clique novamente para confirmar.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Storage Info */}
      <div>
        <h3 className="text-base font-medium text-theme-text mb-4">Armazenamento</h3>
        <Card padding="sm" variant="sidebar">
          <div className="text-sm text-theme-muted space-y-1">
            <div>• Dados armazenados localmente (SQLite) no seu dispositivo</div>
            <div>• Nenhuma informação é enviada para servidores externos</div>
            <div>• Exporte/importe para usar os mesmos dados em outro dispositivo</div>
          </div>
        </Card>
      </div>
    </div>
  );
}
