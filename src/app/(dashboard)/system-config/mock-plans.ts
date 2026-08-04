export interface MockPlan {
  id: string;
  code: string;
  name: string;
  priceValue: string;
  priceUnit: string;
  savingsBadge?: string;
  highlighted?: boolean;
  features: string[];
}

export const initialPlans: MockPlan[] = [
  {
    id: "1",
    code: "free",
    name: "Miễn phí",
    priceValue: "0đ",
    priceUnit: "",
    features: ["Theo dõi giao dịch cơ bản", "1 ví", "Báo cáo hàng tháng"],
  },
  {
    id: "2",
    code: "premium_monthly",
    name: "Premium Tháng",
    priceValue: "49.000đ",
    priceUnit: "/tháng",
    features: ["Không giới hạn ví", "Điểm chi tiêu AI", "Trợ lý AI chatbot", "Báo cáo nâng cao"],
  },
  {
    id: "3",
    code: "premium_yearly",
    name: "Premium Năm",
    priceValue: "490.000đ",
    priceUnit: "/năm",
    savingsBadge: "Tiết kiệm 17%",
    highlighted: true,
    features: ["Không giới hạn ví", "Điểm chi tiêu AI", "Trợ lý AI chatbot", "Báo cáo nâng cao"],
  },
];
