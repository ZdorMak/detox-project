"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import type { RiskBand } from "@/lib/survey/sas-sv";

interface SymptomRadarProps {
  data: Array<{ symptom: string; score: number; max: number }>;
  band: RiskBand;
}

const BAND_FILL: Record<RiskBand, { stroke: string; fill: string }> = {
  low: { stroke: "#10b981", fill: "rgba(16,185,129,0.35)" },
  moderate: { stroke: "#f59e0b", fill: "rgba(245,158,11,0.35)" },
  high: { stroke: "#f43f5e", fill: "rgba(244,63,94,0.35)" },
};

/**
 * Radar (spider) chart of the 6 SAS-SV symptom subscores.
 * Each axis is normalised 0..100% so dimensions with 1 vs 2 items remain
 * comparable.
 */
export function SymptomRadar({ data, band }: SymptomRadarProps) {
  const colors = BAND_FILL[band];
  const normalised = data.map((d) => ({
    symptom: d.symptom,
    pct: Math.round((d.score / d.max) * 100),
    raw: `${d.score} / ${d.max}`,
  }));

  return (
    <div className="aspect-square w-full max-w-md mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={normalised} cx="50%" cy="50%" outerRadius="75%">
          <PolarGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
          <PolarAngleAxis
            dataKey="symptom"
            tick={{
              fill: "hsl(var(--foreground))",
              fontSize: 11,
              fontWeight: 600,
            }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }}
            tickCount={5}
          />
          <Radar
            name="You"
            dataKey="pct"
            stroke={colors.stroke}
            fill={colors.fill}
            fillOpacity={1}
            strokeWidth={2}
            isAnimationActive
            animationDuration={1200}
          />
          <Tooltip
            formatter={(value: number, _name, props) => [
              `${value}% (${props.payload.raw})`,
              "Score",
            ]}
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
