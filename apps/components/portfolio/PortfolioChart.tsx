// components/portfolio/PortfolioChart.tsx
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { getPortfolioHistory } from "@/lib/api";

export default function PortfolioChart() {
  const [range, setRange] = useState<"24h" | "7d" | "30d" | "all">("7d");
  const [data, setData] = useState<
    { value: number; label?: string; date?: string }[]
  >([]);

  useEffect(() => {
    (async () => {
      const rows = await getPortfolioHistory(range);
      const points = rows.map((r: any, idx: number) => {
        const d = new Date(r.recorded_at);
        const label =
          range === "24h"
            ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : d.toLocaleDateString([], { month: "short", day: "numeric" });
        return { value: Number(r.total_value), label, date: d.toISOString() };
      });
      setData(points);
    })();
  }, [range]);

  return (
    <View className="px-4">
      <View className="bg-slate-100 p-1 rounded flex-row items-center justify-between mt-2">
        {(["24h", "7d", "30d", "all"] as const).map((r) => (
          <TouchableOpacity
            key={r}
            onPress={() => setRange(r)}
            className={`flex-1 py-2 rounded ${range === r ? "bg-primary" : ""}`}
          >
            <Text
              className={`text-center font-semibold ${
                range === r ? "text-white" : "text-gray-500"
              }`}
            >
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <LineChart
        data={data}
        areaChart
        curved
        hideRules
        hideDataPoints
        // yAxisLabel="$"
        thickness={2}
        initialSpacing={0}
        color="#4D9351"
        startFillColor="#4D9351"
        endFillColor="#4D9351"
        startOpacity={0.25}
        endOpacity={0.01}
        yAxisTextStyle={{ fontSize: 10 }}
        xAxisLabelTextStyle={{ fontSize: 10 }}
        xAxisThickness={0}
        yAxisThickness={0}
      />
    </View>
  );
}
