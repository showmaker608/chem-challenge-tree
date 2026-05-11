import type { ClassAccess } from '../types';

interface ClassCodeResponse {
  ok: boolean;
  classCode?: string;
  className?: string;
  message?: string;
}

export interface ClassCodeValidationResult {
  ok: boolean;
  classAccess?: ClassAccess;
  message?: string;
}

function normalizeClassCode(classCode: string) {
  return classCode.trim().toUpperCase();
}

function validateDevClassCode(classCode: string): ClassCodeValidationResult {
  const normalized = normalizeClassCode(classCode);

  // 本地测试码
  if (normalized === 'DK2026') {
    return {
      ok: true,
      classAccess: { classCode: 'DK2026', className: '本地测试班' },
    };
  }

  // 正式班级码（生产环境由 CloudBase 云函数校验，此处为本地开发备用）
  const devClasses: Record<string, string> = {
    'DK-CHEM-8B-7392': '八下化学冲刺班',
    'DK-CHEM-9A-4816': '九上一模衔接班',
    'DK-CHEM-DEMO-2605': '演示体验班',
  };

  const className = devClasses[normalized];
  if (className) {
    return {
      ok: true,
      classAccess: { classCode: normalized, className },
    };
  }

  return {
    ok: false,
    message: '班级码不存在或已停用，请向老师确认',
  };
}

export async function validateClassCode(classCode: string): Promise<ClassCodeValidationResult> {
  // DEV 模式或生产环境未配置云函数时，使用本地班级码
  const endpoint = import.meta.env.VITE_CLASS_CODE_VALIDATE_URL;

  if (import.meta.env.DEV || !endpoint) {
    return validateDevClassCode(classCode);
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ classCode: normalizeClassCode(classCode) }),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: '班级码校验服务暂时不可用，请稍后重试',
      };
    }

    const result = (await response.json()) as ClassCodeResponse;

    if (!result.ok || !result.classCode || !result.className) {
      return {
        ok: false,
        message: result.message ?? '班级码不存在或已停用，请向老师确认',
      };
    }

    return {
      ok: true,
      classAccess: {
        classCode: normalizeClassCode(result.classCode),
        className: result.className,
      },
    };
  } catch {
    return {
      ok: false,
      message: '班级码校验失败，请检查网络后重试',
    };
  }
}
