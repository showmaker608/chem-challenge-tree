import { lazy, Suspense } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

export interface InteractiveWidgetProps {
  onComplete?: () => void;
}

const OxygenCollectionWidget = lazy(() => import('./OxygenCollectionLab').then(module => ({ default: module.OxygenCollectionLab })));
const CarbonDioxidePreparationWidget = lazy(() => import('./CarbonDioxidePreparationLab').then(module => ({ default: module.CarbonDioxidePreparationLab })));
const ChemicalSymbolMeaningWidget = lazy(() => import('./ChemicalSymbolMeaningLab').then(module => ({ default: module.ChemicalSymbolMeaningLab })));
const CombustionComparisonWidget = lazy(() => import('./CombustionComparisonLab').then(module => ({ default: module.CombustionComparisonLab })));
const WaterElectrolysisWidget = lazy(() => import('./WaterElectrolysisLab').then(module => ({ default: module.WaterElectrolysisLab })));
const CandleInquiryWidget = lazy(() => import('./CandleInquiryLab').then(module => ({ default: module.CandleInquiryLab })));

const widgets: Record<string, LazyExoticComponent<ComponentType>> = {
  AtomicModelComparison: lazy(() => import('./AtomicModelComparison').then(module => ({ default: module.AtomicModelComparison }))),
  ElectronShellTrainer: lazy(() => import('./ElectronShellTrainer').then(module => ({ default: module.ElectronShellTrainer }))),
  CarbonStructure: lazy(() => import('./CarbonStructure').then(module => ({ default: module.CarbonStructure }))),
  HemoglobinBinding: lazy(() => import('./HemoglobinBinding').then(module => ({ default: module.HemoglobinBinding }))),
  SolubilitySimulator: lazy(() => import('./SolubilitySimulator').then(module => ({ default: module.SolubilitySimulator }))),
  PHIndicatorSandbox: lazy(() => import('./PHIndicatorSandbox').then(module => ({ default: module.PHIndicatorSandbox }))),
  NeutralizationTitrator: lazy(() => import('./NeutralizationTitrator').then(module => ({ default: module.NeutralizationTitrator }))),
  SolutionPrepLab: lazy(() => import('./SolutionPrepLab').then(module => ({ default: module.SolutionPrepLab }))),
  GraduatedCylinderReader: lazy(() => import('./GraduatedCylinderReader').then(module => ({ default: module.GraduatedCylinderReader }))),
  WaterElectrolysisLab: WaterElectrolysisWidget,
  CombustionComparisonLab: CombustionComparisonWidget,
  OxygenCollectionLab: OxygenCollectionWidget,
  CarbonDioxidePreparationLab: CarbonDioxidePreparationWidget,
  ElementMassLab: lazy(() => import('./ElementMassLab').then(module => ({ default: module.ElementMassLab }))),
  ChemicalSymbolMeaningLab: ChemicalSymbolMeaningWidget,
  CandleInquiryLab: CandleInquiryWidget,
};

export function WidgetRegistry({ name, onComplete }: { name: string; onComplete?: () => void }) {
  const Widget = widgets[name];
  if (!Widget) return <div className="text-sm text-red-500 border border-red-300 p-2 rounded-xl bg-red-50">Widget {name} not found</div>;
  return (
    <Suspense fallback={<div className="rounded-2xl border border-teal-100 bg-teal-50 p-4 text-sm font-bold text-teal-800">互动实验正在加载...</div>}>
      {name === 'OxygenCollectionLab'
        ? <OxygenCollectionWidget onComplete={onComplete} />
        : name === 'CarbonDioxidePreparationLab'
          ? <CarbonDioxidePreparationWidget onComplete={onComplete} />
          : name === 'ChemicalSymbolMeaningLab'
            ? <ChemicalSymbolMeaningWidget onComplete={onComplete} />
            : name === 'CombustionComparisonLab'
              ? <CombustionComparisonWidget onComplete={onComplete} />
              : name === 'WaterElectrolysisLab'
                ? <WaterElectrolysisWidget onComplete={onComplete} />
                : name === 'CandleInquiryLab'
                  ? <CandleInquiryWidget onComplete={onComplete} />
                : <Widget />}
    </Suspense>
  );
}
