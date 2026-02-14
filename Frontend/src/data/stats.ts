import { StatCard } from "../types";

export const stats: StatCard[] = [
  {
    label: "Total Products",
    value: "1,248",
    change: "+5.2%",
    isPositive: true,
    icon: "inventory_2",
  },
  {
    label: "Total Clicks",
    value: "42,892",
    change: "+12.4%",
    isPositive: true,
    icon: "ads_click",
  },
  {
    label: "Conversion Rate",
    value: "3.64%",
    change: "-2.1%",
    isPositive: false,
    icon: "auto_graph",
  },
  {
    label: "Total Revenue",
    value: "$12,450",
    change: "+8.9%",
    isPositive: true,
    icon: "payments",
  },
];
