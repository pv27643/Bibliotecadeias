import WorkflowsList from '@/app/components/WorkflowsList';

/**
 * Página principal de Workflows
 * 
 * Uso:
 * import WorkflowsPage from '@/app/pages/WorkflowsPage';
 * 
 * // No App.tsx:
 * <Route path="/workflows" element={<WorkflowsPage />} />
 */

export default function WorkflowsPage() {
  return <WorkflowsList />;
}
