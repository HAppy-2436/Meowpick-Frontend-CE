import { showSuccess } from '@/composables/useStatus';

export const CONTACT_INFO = {
  // TODO: 邮箱暂未提供，FeedbackModal 中对应入口已注释；启用前请替换为真实地址
  email: {
    address: 'feedback@example.com',
    subject: '【选课猫反馈】',
    body: '请详细描述您的问题，建议附上截图和联系方式。\n\n---\n来自选课猫用户反馈'
  },
  qqGroup: {
    number: '344213052'
  }
};

export function copyToClipboard(text: string, successMsg = '已复制'): void {
  uni.setClipboardData({
    data: text,
    success: () => {
      uni.hideToast();
      showSuccess(successMsg);
    }
  });
}
