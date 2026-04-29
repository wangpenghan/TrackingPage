import { cva, type VariantProps } from 'class-variance-authority'

// ===== 卡片变体 =====
export const statusCardVariants = cva(
  'relative flex flex-col rounded-lg border transition-all duration-200 overflow-hidden',
  {
    variants: {
      status: {
        red: 'bg-[#FFF8F8] border-[#FECACA] hover:border-[#FCA5A5] hover:shadow-md',
        orange: 'bg-[#FFFBEB] border-[#FDE68A] hover:border-[#FCD34D] hover:shadow-md',
        blue: 'bg-[#EFF6FF] border-[#BFDBFE] hover:border-[#93C5FD] hover:shadow-md',
        white: 'bg-[#FFFFFF] border-[#E5E7EB] hover:border-[#D1D5DB] hover:shadow-md',
      },
      selected: {
        true: 'border-[#3b82f6] shadow-lg ring-4 ring-[#3b82f6]/40 bg-[#dbeafe]! cursor-pointer',
      },
      expanded: {
        true: 'min-h-[160px]',
        false: 'min-h-[100px] max-h-[108px]',
      },
      hovered: {
        true: 'shadow-md',
      },
    },
    defaultVariants: {
      status: 'white',
    },
  }
)

// ===== 左侧状态条 =====
export const statusBarVariants = cva(
  'absolute left-0 top-0 bottom-0 w-[4px] rounded-l-lg',
  {
    variants: {
      status: {
        red: 'bg-[#FF4D4F]',
        orange: 'bg-[#FA8C16]',
        blue: 'bg-[#1890FF]',
        white: 'hidden',
      },
    },
    defaultVariants: {
      status: 'white',
    },
  }
)

// ===== 车次号变体 =====
export const trainNumberVariants = cva(
  'text-[16px] font-bold tracking-tight',
  {
    variants: {
      type: {
        originating: 'text-[#92400E]',  // 始发 - 深黄色
        passing: 'text-[#6B21A8]',      // 途径 - 深紫色
        terminating: 'text-[#065F46]',  // 终到 - 深绿色
      },
    },
    defaultVariants: {
      type: 'originating',
    },
  }
)

// ===== 时间变体 =====
export const timeVariants = cva(
  'text-[14px] font-semibold tracking-tight',
  {
    variants: {
      type: {
        arrival: 'text-[#DC2626]',
        departure: 'text-[#16A34A]',
      },
    },
    defaultVariants: {
      type: 'arrival',
    },
  }
)

// ===== 标签变体 =====
export const tagVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      variant: {
        primary: 'bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD]',
        success: 'bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7]',
        warning: 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]',
        danger: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]',
        info: 'bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]',
        default: 'bg-[#F3F4F6] text-[#4B5563] border border-[#D1D5DB]',
        // 车次类型颜色：始发黄、途径紫、终到绿
        originating: 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]',
        passing: 'bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE]',
        terminating: 'bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7]',
      },
      size: {
        xs: 'h-[20px] text-[11px] px-1.5',
        sm: 'h-[22px] text-[12px] px-2',
        md: 'h-[26px] text-[13px] px-2.5',
        lg: 'h-[30px] text-[14px] px-3',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

// ===== 地标颜色标签 =====
export const landmarkTagVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium',
  {
    variants: {
      color: {
        green: 'bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7]',
        yellow: 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]',
        blue: 'bg-[#DBEAFE] text-[#1E40AF] border border-[#93C5FD]',
        purple: 'bg-[#F3E8FF] text-[#6B21A8] border border-[#D8B4FE]',
      },
      size: {
        xs: 'h-[18px] text-[10px] px-1',
        sm: 'h-[20px] text-[11px] px-1.5',
        md: 'h-[22px] text-[12px] px-2',
      },
    },
    defaultVariants: {
      color: 'green',
      size: 'sm',
    },
  }
)

// ===== 按钮变体 =====
export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md transition-colors',
  {
    variants: {
      variant: {
        ghost: 'hover:bg-[#F3F4F6] text-[#6B7280]',
        primary: 'bg-[#5e6ad2] text-white hover:bg-[#4F5AC0]',
        danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626]',
      },
      size: {
        'icon-sm': 'w-[28px] h-[28px] p-0',
        icon: 'w-[32px] h-[32px] p-0',
        sm: 'h-[30px] px-3 text-[13px]',
        md: 'h-[34px] px-4 text-[14px]',
        lg: 'h-[40px] px-5 text-[15px]',
      },
    },
    defaultVariants: {
      variant: 'ghost',
      size: 'md',
    },
  }
)

export interface StatusCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusCardVariants> {
  selected?: boolean
  expanded?: boolean
  hovered?: boolean
}

export interface TagProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {}

export interface LandmarkTagProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'green' | 'yellow' | 'blue' | 'purple'
  size?: 'xs' | 'sm' | 'md'
}
