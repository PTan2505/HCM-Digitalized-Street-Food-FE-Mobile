export type PaymentMethod = 'QR Code' | 'Lowca Wallet' | 'PAYOS_PAYOUT';

export type PaymentTransactionStatus =
  | 'PAID'
  | 'PENDING'
  | 'CANCELLED'
  | 'FAILED';

export interface PaymentTransaction {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  amount: number;
  description: string;
  status: PaymentTransactionStatus;
  createdAt: string;
  paidAt: string | null;
  transactionCode: string;
  orderId: number | null;
  branchId: number | null;
  branchCampaignId: number | null;
  paymentMethod: PaymentMethod;
  checkoutUrl: string | null;
}

export interface WithdrawRequest {
  amount: number;
  description: string;
  toBin: string;
  toAccountNumber: string;
}

export interface WithdrawResponse {
  referenceId: string;
  payoutId?: string;
  approvalState?: string;
  currentVendorBalance: number;
}

export interface BankOption {
  bin: string;
  shortName: string;
  name: string;
  bankLogoUrl: string;
  isDisburse: boolean;
}

export const BANK_OPTIONS: Record<string, BankOption> = {
  KLB: {
    bin: '970452',
    shortName: 'KienLongBank',
    name: 'Ngân hàng TMCP Kiên Long',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/KLB.png',
    isDisburse: true,
  },
  STB: {
    bin: '970403',
    shortName: 'Sacombank',
    name: 'Ngân hàng TMCP Sài Gòn Thương Tín',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/STB.png',
    isDisburse: true,
  },
  IBKHN: {
    bin: '970455',
    shortName: 'IBKHN',
    name: 'Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh Hà Nội',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_ibk_bank.png',
    isDisburse: true,
  },
  BIDV: {
    bin: '970418',
    shortName: 'BIDV',
    name: 'Ngân hàng TMCP Đầu tư và Phát triển Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/BIDV.png',
    isDisburse: true,
  },
  VRB: {
    bin: '970421',
    shortName: 'VRB',
    name: 'Ngân hàng Liên doanh Việt - Nga',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VRB.png',
    isDisburse: true,
  },
  KEBHANAHCM: {
    bin: '970466',
    shortName: 'Keb Hana - HCM',
    name: 'Ngân hàng KEB Hana – Chi nhánh Thành phố Hồ Chí Minh',
    bankLogoUrl: 'https://img.mservice.com.vn/app/img/payment/KEBHANAHCM.png',
    isDisburse: true,
  },
  SHB: {
    bin: '970443',
    shortName: 'SHB',
    name: 'Ngân hàng TMCP Sài Gòn - Hà Nội',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/SHB.png',
    isDisburse: true,
  },
  PBVN: {
    bin: '970439',
    shortName: 'PublicBank',
    name: 'Ngân hàng TNHH MTV Public Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/PBVN.png',
    isDisburse: true,
  },
  DBS: {
    bin: '796500',
    shortName: 'DBSBank',
    name: 'DBS Bank Ltd - Chi nhánh Thành phố Hồ Chí Minh',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_dbs.png',
    isDisburse: true,
  },
  VARB: {
    bin: '970405',
    shortName: 'Agribank',
    name: 'Ngân hàng Nông nghiệp và Phát triển Nông thôn Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VARB.png',
    isDisburse: true,
  },
  CFC: {
    bin: '970460',
    shortName: 'VietCredit',
    name: 'Công ty Tài chính Cổ Phần Tín Việt',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/CFC.png',
    isDisburse: false,
  },
  MB: {
    bin: '970422',
    shortName: 'MBBank',
    name: 'Ngân hàng TMCP Quân đội',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/MB.png',
    isDisburse: true,
  },
  VB: {
    bin: '970433',
    shortName: 'VietBank',
    name: 'Ngân hàng TMCP Việt Nam Thương Tín',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VB.png',
    isDisburse: true,
  },
  EIB: {
    bin: '970431',
    shortName: 'Eximbank',
    name: 'Ngân hàng TMCP Xuất Nhập khẩu Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/EIB.png',
    isDisburse: true,
  },
  VNPTMONEY: {
    bin: '971011',
    shortName: 'VNPTMoney',
    name: 'VNPT Money',
    bankLogoUrl: 'https://img.mservice.com.vn/app/img/payment/VNPTMONEY.png',
    isDisburse: false,
  },
  SGB: {
    bin: '970400',
    shortName: 'SaigonBank',
    name: 'Ngân hàng TMCP Sài Gòn Công Thương',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/SGB.png',
    isDisburse: true,
  },
  CAKE: {
    bin: '546034',
    shortName: 'CAKE',
    name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số CAKE by VPBank',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_cake.png',
    isDisburse: true,
  },
  PGB: {
    bin: '970430',
    shortName: 'PGBank',
    name: 'Ngân hàng TMCP Xăng dầu Petrolimex',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/PGB.png',
    isDisburse: true,
  },
  NVB: {
    bin: '970419',
    shortName: 'NCB',
    name: 'Ngân hàng TMCP Quốc Dân',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/NVB.png',
    isDisburse: true,
  },
  HSBC: {
    bin: '458761',
    shortName: 'HSBC',
    name: 'Ngân hàng TNHH MTV HSBC (Việt Nam)',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_hsbc.png',
    isDisburse: true,
  },
  STANDARD: {
    bin: '970410',
    shortName: 'StandardChartered',
    name: 'Ngân hàng TNHH MTV Standard Chartered Bank Việt Nam',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_standard_chartered.png',
    isDisburse: true,
  },
  TCB: {
    bin: '970407',
    shortName: 'Techcombank',
    name: 'Ngân hàng TMCP Kỹ thương Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/TCB.png',
    isDisburse: true,
  },
  IVB: {
    bin: '970434',
    shortName: 'IndovinaBank',
    name: 'Ngân hàng TNHH Indovina',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/IVB.png',
    isDisburse: true,
  },
  VCB: {
    bin: '970436',
    shortName: 'VietcomBank',
    name: 'Ngân hàng TMCP Ngoại Thương Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VCB.png',
    isDisburse: true,
  },
  KEBHANAHN: {
    bin: '970467',
    shortName: 'Keb Hana- HN',
    name: 'Ngân hàng KEB Hana – Chi nhánh Hà Nội',
    bankLogoUrl: 'https://img.mservice.com.vn/app/img/payment/KEBHANAHCM.png',
    isDisburse: true,
  },
  SVB: {
    bin: '970424',
    shortName: 'ShinhanBank',
    name: 'Ngân hàng TNHH MTV Shinhan Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/SVB.png',
    isDisburse: true,
  },
  KBHN: {
    bin: '970462',
    shortName: 'KookminHN',
    name: 'Ngân hàng Kookmin - Chi nhánh Hà Nội',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_kookmin_hn.png',
    isDisburse: true,
  },
  LPB: {
    bin: '970449',
    shortName: 'LPBank',
    name: 'NH TMCP Loc Phat Viet Nam',
    bankLogoUrl:
      'https://static.momocdn.net/files/cGF5bWVudHNkaw==/image/LPB.png',
    isDisburse: true,
  },
  PVCB: {
    bin: '970412',
    shortName: 'PVcomBank',
    name: 'Ngân hàng TMCP Đại Chúng Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/PVCB.png',
    isDisburse: true,
  },
  ABB: {
    bin: '970425',
    shortName: 'ABBANK',
    name: 'Ngân hàng TMCP An Bình',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/ABB.png',
    isDisburse: true,
  },
  CBB: {
    bin: '970444',
    shortName: 'CBBank',
    name: 'Ngân hàng Thương mại TNHH MTV Xây dựng Việt Nam',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_cbbank.png',
    isDisburse: true,
  },
  KBHCM: {
    bin: '970463',
    shortName: 'KookminHCM',
    name: 'Ngân hàng Kookmin - Chi nhánh Thành phố Hồ Chí Minh',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_kookmin_hcm.png',
    isDisburse: true,
  },
  HDB: {
    bin: '970437, 970420',
    shortName: 'HDBank',
    name: 'Ngân hàng TMCP Phát triển Thành phố Hồ Chí Minh',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/HDB.png',
    isDisburse: true,
  },
  TPB: {
    bin: '970423',
    shortName: 'TPBank',
    name: 'Ngân hàng TMCP Tiên Phong',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/TPB.png',
    isDisburse: true,
  },
  VPB: {
    bin: '970432',
    shortName: 'VPBank',
    name: 'Ngân hàng TMCP Việt Nam Thịnh Vượng',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VPB.png',
    isDisburse: true,
  },
  Ubank: {
    bin: '546035',
    shortName: 'Ubank',
    name: 'TMCP Việt Nam Thịnh Vượng - Ngân hàng số Ubank by VPBank',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_ubank.png',
    isDisburse: true,
  },
  WOO: {
    bin: '970457',
    shortName: 'Woori',
    name: 'Ngân hàng TNHH MTV Woori Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/WOO.png',
    isDisburse: true,
  },
  MBV: {
    bin: '970414',
    shortName: 'MBV',
    name: 'Ngân hàng TNHH MTV Việt Nam Hiện Đại',
    bankLogoUrl:
      'https://static.momocdn.net/files/cGF5bWVudHNkaw==/image/MBV.png',
    isDisburse: true,
  },
  VTLMONEY: {
    bin: '971005',
    shortName: 'ViettelMoney',
    name: 'Viettel Money',
    bankLogoUrl: 'https://img.mservice.com.vn/app/img/payment/VIETTELMONEY.png',
    isDisburse: true,
  },
  SEAB: {
    bin: '970440',
    shortName: 'SeABank',
    name: 'Ngân hàng TMCP Đông Nam Á',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/Seab.png',
    isDisburse: true,
  },
  IBKHCM: {
    bin: '970456',
    shortName: 'IBKHCM',
    name: 'Ngân hàng Công nghiệp Hàn Quốc - Chi nhánh TP. Hồ Chí Minh',
    bankLogoUrl: 'https://img.mservice.com.vn/app/img/payment/IBK.png',
    isDisburse: true,
  },
  COB: {
    bin: '970446',
    shortName: 'COOPBANK',
    name: 'Ngân hàng Hợp tác xã Việt Nam',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_coop_bank.png',
    isDisburse: true,
  },
  MSB: {
    bin: '970426',
    shortName: 'MSB',
    name: 'Ngân hàng TMCP Hàng Hải',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/MSB.png',
    isDisburse: true,
  },
  ACB: {
    bin: '970416',
    shortName: 'ACB',
    name: 'Ngân hàng TMCP Á Châu',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/ACB.png',
    isDisburse: true,
  },
  NASB: {
    bin: '970409',
    shortName: 'BacABank',
    name: 'Ngân hàng TMCP Bắc Á',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/NASB.png',
    isDisburse: true,
  },
  CIMB: {
    bin: '422589',
    shortName: 'CIMB',
    name: 'Ngân hàng TNHH MTV CIMB Việt Nam',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_cimb.png',
    isDisburse: true,
  },
  VCCB: {
    bin: '970454',
    shortName: 'VietCapitalBank',
    name: 'Ngân hàng TMCP Bản Việt',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VCCB.png',
    isDisburse: true,
  },
  KBankHCM: {
    bin: '668888',
    shortName: 'KBank',
    name: 'Ngân hàng Đại chúng TNHH Kasikornbank',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_kbank.png',
    isDisburse: true,
  },
  CTG: {
    bin: '970415',
    shortName: 'VietinBank',
    name: 'Ngân hàng TMCP Công thương Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/CTG.png',
    isDisburse: true,
  },
  UOB: {
    bin: '970458',
    shortName: 'UnitedOverseas',
    name: 'Ngân hàng United Overseas - Chi nhánh TP. Hồ Chí Minh',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/UOB.png',
    isDisburse: true,
  },
  HLB: {
    bin: '970442',
    shortName: 'HongLeong',
    name: 'Ngân hàng TNHH MTV Hong Leong Việt Nam',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_hong_leon_bank.png',
    isDisburse: true,
  },
  NAB: {
    bin: '970428',
    shortName: 'NamABank',
    name: 'Ngân hàng TMCP Nam Á',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/NAB.png',
    isDisburse: true,
  },
  VIB: {
    bin: '970441',
    shortName: 'VIB',
    name: 'Ngân hàng TMCP Quốc tế Việt Nam',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VIB.png',
    isDisburse: true,
  },
  BVB: {
    bin: '970438',
    shortName: 'BaoVietBank',
    name: 'Ngân hàng TMCP Bảo Việt',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/BVB.png',
    isDisburse: true,
  },
  OCB: {
    bin: '970448',
    shortName: 'OCB',
    name: 'Ngân hàng TMCP Phương Đông',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/OCB.png',
    isDisburse: true,
  },
  TIMO: {
    bin: '963388',
    shortName: 'Timo',
    name: 'Ngân hàng số Timo by Ban Viet Bank (Timo by Ban Viet Bank)',
    bankLogoUrl: 'https://img.mservice.com.vn/app/img/payment/TIMO.png',
    isDisburse: true,
  },
  NonghyupBankHN: {
    bin: '801011',
    shortName: 'Nonghyup',
    name: 'Ngân hàng Nonghyup - Chi nhánh Hà Nội',
    bankLogoUrl:
      'https://img.mservice.io/momo_app_v2/new_version/All_team_/new_logo_bank/ic_nonghyu.png',
    isDisburse: true,
  },
  MAFC: {
    bin: '970468',
    shortName: 'MTV Mirae Asset',
    name: 'Công ty Tài chính TNHH MTV Mirae Asset (Việt Nam)',
    bankLogoUrl: 'https://img.mservice.com.vn/app/img/payment/MAFC.png',
    isDisburse: true,
  },
  SCB: {
    bin: '970429',
    shortName: 'SCB',
    name: 'Ngân hàng TMCP Sài Gòn',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/SCB.png',
    isDisburse: true,
  },
  VAB: {
    bin: '970427',
    shortName: 'VietABank',
    name: 'Ngân hàng TMCP Việt Á',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/VAB.png',
    isDisburse: true,
  },
  GPB: {
    bin: '970408',
    shortName: 'GPBank',
    name: 'Ngân hàng Thương mại TNHH MTV Dầu Khí Toàn Cầu',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/GPB.png',
    isDisburse: true,
  },
  CITI: {
    bin: '533948',
    shortName: 'CITI',
    name: 'NH Citi',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_citibank.png',
    isDisburse: true,
  },
  VBSP: {
    bin: '999888',
    shortName: 'VBSP',
    name: 'Ngân Hàng Chính Sách Xã Hội',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_vbsp.png',
    isDisburse: true,
  },
  PVcomBankPay: {
    bin: '971133',
    shortName: 'PVcomBank Pay',
    name: 'PVcomBank Pay',
    bankLogoUrl: 'https://img.mservice.com.vn/momo_app_v2/img/PVCB.png',
    isDisburse: true,
  },
  BNPPARIBASHN: {
    bin: '963668',
    shortName: 'BNP PARIBAS HN',
    name: 'Ngân hàng BNP Paribas - CN Hà Nội',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_bnp.png',
    isDisburse: true,
  },
  BNPPARIBASHCM: {
    bin: '963666',
    shortName: 'BNP PARIBAS HCM',
    name: 'Ngân hàng BNP Paribas - CN TP.HCM',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_bnp.png',
    isDisburse: true,
  },
  CUBHCM: {
    bin: '168999',
    shortName: 'Cathay -HCM',
    name: 'Ngân hàng Cathay United - CN TP.HCM',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_cub.png',
    isDisburse: true,
  },
  BIDC: {
    bin: '555666',
    shortName: 'BIDC',
    name: 'Đầu tư và Phát triển Campuchia - Chi nhánh Hà Nội',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_bidc.png',
    isDisburse: true,
  },
  SVFC: {
    bin: '963368',
    shortName: 'Tài chính Shinhan',
    name: 'Công ty Tài chính TNHH MTV Shinhan Việt Nam',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_shinhan_finance.png',
    isDisburse: true,
  },
  BOCHK: {
    bin: '963688',
    shortName: 'Bank of China (HK) - HCM',
    name: 'Ngân hàng Bank of China (Hongkong) Limited – Chi nhánh Hồ Chí Minh',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_bochk.png',
    isDisburse: true,
  },
  VikkiHDBANK: {
    bin: '963311',
    shortName: 'Vikki by HDBank',
    name: 'Vikki by HDBank',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_vikki.png',
    isDisburse: true,
  },
  Umee: {
    bin: '963399',
    shortName: 'Umee',
    name: 'UMEE by Kienlongbank',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_umee.png',
    isDisburse: true,
  },
  Liobank: {
    bin: '963369',
    shortName: 'Liobank',
    name: 'Liobank by OCB',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_lio.png',
    isDisburse: true,
  },
  MVAS: {
    bin: '971032',
    shortName: 'MVAS',
    name: 'Trung tâm Dịch vụ số Mobifone - CN Tổng Công ty viễn thông Mobifone',
    bankLogoUrl:
      'https://static.momocdn.net/app/img/momo_app_v2/new_version/All_team/bank/ic_mvas.png',
    isDisburse: true,
  },
};
