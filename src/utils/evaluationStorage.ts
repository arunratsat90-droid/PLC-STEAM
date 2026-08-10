import { SchoolEvaluation } from '../types';

const STORAGE_KEY = 'steam_school_evaluations_v2';

// Helper to determine quality level based on score out of 24
export function computeQualityLevel(totalScore: number): 'ดีเยี่ยม' | 'ดี' | 'พอใช้' {
  if (totalScore >= 20) return 'ดีเยี่ยม';
  if (totalScore >= 16) return 'ดี';
  return 'พอใช้';
}

// Default mock evaluations for each specific school with distinct academic assessments
const DEFAULT_EVALUATIONS: Record<string, SchoolEvaluation> = {
  'โรงเรียวัดตะโกรวม': {
    schoolId: 'วัดตะโกรวม',
    schoolName: 'โรงเรียวัดตะโกรวม',
    aiTotalScore: 23,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'วิเคราะห์สภาพปัญหาและบริบทชุมชนลุ่มน้ำได้ลึกซึ้ง บูรณาการสะตีมศึกษาครบ 5 สาขาวิชาอย่างเป็นระบบ',
    userTotalScore: 23,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 3, 8: 3 },
    totalScore: 23,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'วิเคราะห์สภาพปัญหาและบริบทชุมชนลุ่มน้ำได้ลึกซึ้ง บูรณาการสะตีมศึกษาครบ 5 สาขาวิชาอย่างเป็นระบบ มีชิ้นงานนวัตกรรมผู้เรียนเชิงประจักษ์ ควรกำหนดตัวชี้วัดเชิงปริมาณของสมรรถนะผู้เรียนเพิ่มเติม',
    evaluatorName: 'ศน.ภัทราภรณ์ สุขสวัสดิ์',
    updatedAt: '2026-08-09T10:30:00Z',
  },
  'โรงเรียนวัดโฆสิทธาราม': {
    schoolId: 'วัดโฆสิทธาราม',
    schoolName: 'โรงเรียนวัดโฆสิทธาราม',
    aiTotalScore: 22,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'ออกแบบกิจกรรมโครงงาน 6 ขั้นตอนได้โดดเด่น ส่งเสริมกระบวนการแก้ปัญหาอย่างเป็นขั้นตอน',
    userTotalScore: 22,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 2, 6: 3, 7: 2, 8: 3 },
    totalScore: 22,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'ออกแบบกิจกรรมโครงงาน 6 ขั้นตอนได้โดดเด่น ส่งเสริมให้ผู้เรียนฝึกกระบวนการแก้ปัญหาอย่างเป็นขั้นตอน มีเครื่องมือวัดผลแบบ Rubrics หลากหลาย ควรเพิ่มการใช้สื่อเทคโนโลยีในการจัดกิจกรรม',
    evaluatorName: 'ดร.วิชัย ประเสริฐสังข์',
    updatedAt: '2026-08-08T14:15:00Z',
  },
  'โรงเรียนวัดวังกะจับ': {
    schoolId: 'วัดวังกะจับ',
    schoolName: 'โรงเรียนวัดวังกะจับ',
    aiTotalScore: 19,
    aiQualityLevel: 'ดี',
    aiNotes: 'บูรณาการสะตีมศึกษาได้เหมาะสม มีการฝึกทักษะการปฏิบัติจริงของผู้เรียน',
    userTotalScore: 19,
    userQualityLevel: 'ดี',
    scores: { 1: 2, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 2, 8: 3 },
    totalScore: 19,
    qualityLevel: 'ดี',
    isEvaluatedByUser: false,
    evaluatorNotes: 'การเชื่อมโยงองค์ความรู้ระหว่างสาขาวิชา Art และ Math ยังไม่ชัดเจนในบางขั้นตอน ควรเน้นการฝึกทักษะการสื่อสารและการนำเสนอผลงานของผู้เรียนเพิ่มขึ้นเพื่อให้ครอบคลุมทักษะในศตวรรษที่ 21',
    evaluatorName: 'ศน.สมคิด มีพร้อม',
    updatedAt: '2026-08-07T11:20:00Z',
  },
  'โรงเรีียนวัดศรัทธาภิรม': {
    schoolId: 'วัดศรัทธาภิรม',
    schoolName: 'โรงเรีียนวัดศรัทธาภิรม',
    aiTotalScore: 24,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'เป็นต้นแบบ Best Practice การจัดการเรียนรู้ STEAM Active Learning สมบูรณ์แบบทุกมิติ',
    userTotalScore: 24,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 },
    totalScore: 24,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'เป็นต้นแบบ (Best Practice) การจัดการเรียนรู้ STEAM Active Learning มีการวิเคราะห์ปัญหาเชื่อมโยงกับมาตรฐานตัวชี้วัดอย่างเป็นเหตุเป็นผล ผู้เรียนมีสมรรถนะการคิดวิเคราะห์และการแก้ปัญหาในระดับดีเยี่ยม',
    evaluatorName: 'คณะกรรมการประเมินคุณภาพ สพป.สิงห์บุรี',
    updatedAt: '2026-08-09T09:00:00Z',
  },
  'โรงเรียนวัดกลาง': {
    schoolId: 'วัดกลาง',
    schoolName: 'โรงเรียนวัดกลาง',
    aiTotalScore: 20,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'รายงานผลลัพธ์ผู้เรียนชัดเจน มีหลักฐานร่องรอยการเรียนรู้เชิงประจักษ์',
    userTotalScore: 20,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 3, 6: 2, 7: 2, 8: 2 },
    totalScore: 20,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'รายงานผลลัพธ์ผู้เรียนมีความชัดเจน มีหลักฐานร่องรอยการเรียนรู้เชิงประจักษ์ ควรปรับปรุงภาษาและการเรียบเรียงในส่วนของกระบวนการวิศวกรรมให้มีความต่อเนื่องและกระชับยิ่งขึ้น',
    evaluatorName: 'ศน.สุภาภรณ์ ชัยสิทธิ์',
    updatedAt: '2026-08-06T16:45:00Z',
  },
  'โรงเรียนวัดสว่างอารมณ์': {
    schoolId: 'วัดสว่างอารมณ์',
    schoolName: 'โรงเรียนวัดสว่างอารมณ์',
    aiTotalScore: 18,
    aiQualityLevel: 'ดี',
    aiNotes: 'จัดกิจกรรมครบ 6 ขั้นตอนของโครงงาน แต่ควรเพิ่มข้อมูลสถิติมารองรับการระบุปัญหา',
    userTotalScore: 18,
    userQualityLevel: 'ดี',
    scores: { 1: 2, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 2 },
    totalScore: 18,
    qualityLevel: 'ดี',
    isEvaluatedByUser: false,
    evaluatorNotes: 'จัดกิจกรรมครบ 6 ขั้นตอนของโครงงาน แต่การระบุปัญหาในขั้นแรกยังขาดข้อมูลเชิงประจักษ์สนับสนุน ควรเพิ่มแบบประเมินตนเองและแบบประเมินโดยเพื่อนร่วมชั้นเพื่อสะท้อนพัฒนาการผู้เรียน',
    evaluatorName: 'อ.ประนอม ศรีสุข',
    updatedAt: '2026-08-05T13:30:00Z',
  },
  'โรงเรียนชุมชนวัดดงยาง': {
    schoolId: 'วัดดงยาง',
    schoolName: 'โรงเรียนชุมชนวัดดงยาง',
    aiTotalScore: 21,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'โดดเด่นด้านการบูรณาการภูมิปัญญาท้องถิ่นเข้ากับวิทยาศาสตร์และคณิตศาสตร์',
    userTotalScore: 21,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 3, 6: 2, 7: 3, 8: 2 },
    totalScore: 21,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'โดดเด่นในด้านการบูรณาการภูมิปัญญาท้องถิ่นเข้ากับวิทยาศาสตร์และคณิตศาสตร์ ผู้เรียนเกิดทักษะการทำงานเป็นทีม ควรพัฒนาลำดับขั้นกิจกรรมโครงงานให้มีความยืดหยุ่นมากยิ่งขึ้น',
    evaluatorName: 'ศน.อานนท์ วงศ์สว่าง',
    updatedAt: '2026-08-08T15:10:00Z',
  },
  'โรงเรียนวัดราษฎร์ประสิทธิ์': {
    schoolId: 'วัดราษฎร์ประสิทธิ์',
    schoolName: 'โรงเรียนวัดราษฎร์ประสิทธิ์',
    aiTotalScore: 17,
    aiQualityLevel: 'ดี',
    aiNotes: 'การบูรณาการ STEAM ครอบคลุม 5 สาขา แต่ควรพัฒนาการเชื่อมโยงกับตัวชี้วัดหลัก',
    userTotalScore: 17,
    userQualityLevel: 'ดี',
    scores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 3, 8: 2 },
    totalScore: 17,
    qualityLevel: 'ดี',
    isEvaluatedByUser: false,
    evaluatorNotes: 'การบูรณาการ STEAM ครอบคลุม 5 สาขา แต่บางสาขายังเป็นเพียงกิจกรรมเสริม ควรหลอมรวมองค์ความรู้เข้ากับตัวชี้วัดหลักของรายวิชาให้เป็นเนื้อเดียวกัน และพัฒนาแบบสังเกตพฤติกรรมเพิ่มเติม',
    evaluatorName: 'คณะกรรมการนิเทศ กลุ่มสิงห์เจ้าพระยา',
    updatedAt: '2026-08-04T10:00:00Z',
  },
  'โรงเรียนวัดข่อย': {
    schoolId: 'วัดข่อย',
    schoolName: 'โรงเรียนวัดข่อย',
    aiTotalScore: 23,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'กระบวนการออกแบบเชิงวิศวกรรมทำได้อย่างเป็นระบบ ชัดเจน แก้ปัญหาบริบทจริงได้ดี',
    userTotalScore: 23,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 2, 8: 3 },
    totalScore: 23,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'กระบวนการออกแบบเชิงวิศวกรรม (Engineering Design Process) ทำได้อย่างเป็นระบบและชัดเจนมาก ผู้เรียนสามารถแก้ปัญหาจริงในบริบทโรงเรียนได้ ควรเพิ่มการนำเสนอสื่อดิจิทัลในการเผยแพร่ผลงาน',
    evaluatorName: 'ดร.กนกวรรณ จิตต์มงคล',
    updatedAt: '2026-08-09T08:30:00Z',
  },
  'โรงเรียนวัดหนองสุ่ม': {
    schoolId: 'วัดหนองสุ่ม',
    schoolName: 'โรงเรียนวัดหนองสุ่ม',
    aiTotalScore: 20,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'ระบุปัญหาได้สอดคล้องกับสภาพจริง สื่อแหล่งเรียนรู้หลากหลายและทันสมัย',
    userTotalScore: 20,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 2 },
    totalScore: 20,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'ระบุปัญหาของนักเรียนและชุมชนได้สอดคล้องกับสภาพจริง สื่อและแหล่งเรียนรู้มีความหลากหลายและทันสมัย ควรเพิ่มความเชื่อมโยงระหว่างผลงานผู้เรียนกับเกณฑ์ประเมินสมรรถนะศตวรรษที่ 21',
    evaluatorName: 'ศน.เกศรินทร์ บุญมี',
    updatedAt: '2026-08-07T14:40:00Z',
  },
  'โรงเรียนวัดชะอมสามัคคีธรรม': {
    schoolId: 'วัดชะอมสามัคคีธรรม',
    schoolName: 'โรงเรียนวัดชะอมสามัคคีธรรม',
    aiTotalScore: 19,
    aiQualityLevel: 'ดี',
    aiNotes: 'ผู้เรียนแสดงออกถึงทักษะการแก้ปัญหาและการลงมือปฏิบัติจริงได้ดี',
    userTotalScore: 19,
    userQualityLevel: 'ดี',
    scores: { 1: 2, 2: 3, 3: 2, 4: 2, 5: 3, 6: 2, 7: 2, 8: 3 },
    totalScore: 19,
    qualityLevel: 'ดี',
    isEvaluatedByUser: false,
    evaluatorNotes: 'ผู้เรียนแสดงออกถึงทักษะการแก้ปัญหาและการลงมือปฏิบัติจริงได้เป็นอย่างดี ควรปรับปรุงการเขียนรายงานในส่วนการวิเคราะห์สภาพปัญหาให้มีข้อมูลสถิติรองรับเพื่อให้รายงานสมบูรณ์ยิ่งขึ้น',
    evaluatorName: 'ศน.ณัฐพล เพชรแท้',
    updatedAt: '2026-08-06T11:15:00Z',
  },
  'โรงเรียนวัดบ้านลำ': {
    schoolId: 'วัดบ้านลำ',
    schoolName: 'โรงเรียนวัดบ้านลำ',
    aiTotalScore: 22,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'มีการประเมินผลตามสภาพจริงหลากหลาย มีชิ้นงานการทดลองชัดเจน',
    userTotalScore: 22,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 2, 6: 3, 7: 2, 8: 3 },
    totalScore: 22,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'มีการประเมินผลตามสภาพจริง (Authentic Assessment) ที่หลากหลาย ทั้งการสังเกต ชิ้นงาน และการนำเสนอผลงาน ควรเพิ่มการสนับสนุนสื่ออุปกรณ์เทคโนโลยีในการทดลอง',
    evaluatorName: 'คณะกรรมการประเมินกลุ่มพระอินทร์',
    updatedAt: '2026-08-08T09:20:00Z',
  },
  'โรงเรียนวัดเสือข้าม': {
    schoolId: 'วัดเสือข้าม',
    schoolName: 'โรงเรียนวัดเสือข้าม',
    aiTotalScore: 16,
    aiQualityLevel: 'ดี',
    aiNotes: 'รายงานมีความครบถ้วน ควรเพิ่มความเข้มข้นของการใช้เทคโนโลยีและศิลปะในการทดลอง',
    userTotalScore: 16,
    userQualityLevel: 'ดี',
    scores: { 1: 2, 2: 2, 3: 2, 4: 2, 5: 2, 6: 2, 7: 2, 8: 2 },
    totalScore: 16,
    qualityLevel: 'ดี',
    isEvaluatedByUser: false,
    evaluatorNotes: 'รายงานมีความครบถ้วนตามโครงสร้างพื้นฐาน ควรพัฒนาการบูรณาการสาขา Technology และ Arts ให้มีบทบาทสำคัญในโครงงานมากกว่าการเป็นเพียงเครื่องมือตกแต่ง',
    evaluatorName: 'ศน.สมพร คงเจริญ',
    updatedAt: '2026-08-03T16:00:00Z',
  },
  'โรงเรียนวัดปลาไหล': {
    schoolId: 'วัดปลาไหล',
    schoolName: 'โรงเรียนวัดปลาไหล',
    aiTotalScore: 21,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'นำเสนอรายงานเป็นลำดับขั้นตอน ใช้ภาษาเข้าใจง่าย ผลงานมีนวัตกรรมสร้างสรรค์',
    userTotalScore: 21,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 2, 5: 3, 6: 2, 7: 3, 8: 2 },
    totalScore: 21,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'นำเสนอรายงานได้อย่างเป็นลำดับขั้นตอน ใช้ภาษาเข้าใจง่าย ชัดเจน ผู้เรียนมีผลงานชิ้นงานนวัตกรรมที่ประยุกต์ใช้วิทยาศาสตร์และศิลปะได้อย่างสร้างสรรค์',
    evaluatorName: 'ดร.ปิยพงษ์ สุวรรณโชติ',
    updatedAt: '2026-08-07T16:30:00Z',
  },
  'โรงเรียนวัดหลวง': {
    schoolId: 'วัดหลวง',
    schoolName: 'โรงเรียนวัดหลวง',
    aiTotalScore: 23,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'แผนกิจกรรมและรายงานสอดคล้องกันดีเยี่ยม สะท้อนทักษะศตวรรษที่ 21 ชัดเจน',
    userTotalScore: 23,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 3, 8: 3 },
    totalScore: 23,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'แผนการจัดกิจกรรมและการรายงานผลลัพธ์ผู้เรียนมีความสอดคล้องกันดีเยี่ยม มีการสะท้อนทักษะศตวรรษที่ 21 ทั้งการคิดสร้างสรรค์และการทำงานร่วมกันอย่างเป็นรูปธรรม',
    evaluatorName: 'ศน.วรรณภา จันทร์ดี',
    updatedAt: '2026-08-09T07:45:00Z',
  },
  'โรงเรียนวัดชันสูตร': {
    schoolId: 'วัดชันสูตร',
    schoolName: 'โรงเรียนวัดชันสูตร',
    aiTotalScore: 22,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'จุดเด่นด้านเครื่องมือวัดประเมินผล รูบริคและ Checklist ตรงตามสมรรถนะเป้าหมาย',
    userTotalScore: 22,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 3, 6: 3, 7: 2, 8: 3 },
    totalScore: 22,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'มีจุดเด่นในการใช้เครื่องมือวัดและประเมินผล รูบริคและ Checklist ตรงตามสมรรถนะเป้าหมาย ควรส่งเสริมให้ผู้เรียนนำเสนอผลงานสู่ชุมชนภายนอก',
    evaluatorName: 'คณะประเมินกลุ่มบางระจัน',
    updatedAt: '2026-08-08T13:00:00Z',
  },
  'โรงเรียนวัดสังฆราชาสวาส': {
    schoolId: 'วัดสังฆราชาสวาส',
    schoolName: 'โรงเรียนวัดสังฆราชาสวาส',
    aiTotalScore: 18,
    aiQualityLevel: 'ดี',
    aiNotes: 'เน้นผู้เรียนปฏิบัติจริงได้ดี ควรเพิ่มรายละเอียดวิเคราะห์เชื่อมโยงมาตรฐานตัวชี้วัด',
    userTotalScore: 18,
    userQualityLevel: 'ดี',
    scores: { 1: 2, 2: 2, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 2 },
    totalScore: 18,
    qualityLevel: 'ดี',
    isEvaluatedByUser: false,
    evaluatorNotes: 'กิจกรรมโครงงานเน้นผู้เรียนปฏิบัติจริงได้ดี ควรเพิ่มรายละเอียดในรายงานเกี่ยวกับการวิเคราะห์เชื่อมโยงมาตรฐานตัวชี้วัดกับจุดประสงค์การเรียนรู้ให้ชัดเจนขึ้น',
    evaluatorName: 'ศน.พรทิพย์ สุวรรณรัตน์',
    updatedAt: '2026-08-05T15:20:00Z',
  },
  'โรงเรียนบ้านทุ่งกลับ': {
    schoolId: 'บ้านทุ่งกลับ',
    schoolName: 'โรงเรียนบ้านทุ่งกลับ',
    aiTotalScore: 20,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'ใช้วัสดุอุปกรณ์ท้องถิ่นผสมผสานสื่อทันสมัยได้อย่างดี มีร่องรอยผลงานผู้เรียนชัดเจน',
    userTotalScore: 20,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 2, 4: 3, 5: 2, 6: 2, 7: 3, 8: 2 },
    totalScore: 20,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'ใช้วัสดุอุปกรณ์ในท้องถิ่นและสื่อการเรียนรู้ทันสมัยผสมผสานกันอย่างเหมาะสม มีร่องรอยผลงานผู้เรียนชัดเจน ควรเสริมทักษะการคำนวณในส่วนของ Mathematics',
    evaluatorName: 'คณะกรรมการนิเทศกลุ่มเตาเผาแม่น้ำน้อย',
    updatedAt: '2026-08-06T14:10:00Z',
  },
  'โรงเรียนวัดโบสถ์ (อินทร์บุรี)': {
    schoolId: 'วัดโบสถ์ (อินทร์บุรี)',
    schoolName: 'โรงเรียนวัดโบสถ์ (อินทร์บุรี)',
    aiTotalScore: 24,
    aiQualityLevel: 'ดีเยี่ยม',
    aiNotes: 'รายงานมีความสมบูรณ์แบบในทุกองค์ประกอบ การบูรณาการ 5 สาขาวิชาเชื่อมโยงอย่างสละสลวย',
    userTotalScore: 24,
    userQualityLevel: 'ดีเยี่ยม',
    scores: { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 },
    totalScore: 24,
    qualityLevel: 'ดีเยี่ยม',
    isEvaluatedByUser: false,
    evaluatorNotes: 'รายงานมีความสมบูรณ์แบบในทุกองค์ประกอบ การวิเคราะห์ปัญหา การบูรณาการ 5 สาขาวิชา และผลลัพธ์ผู้เรียนเชื่อมโยงอย่างเป็นเหตุเป็นผลด้วยภาษาที่สละสลวย สมควรได้รับการยกย่องเป็นแบบอย่าง',
    evaluatorName: 'คณะกรรมการประเมินระดับเขตพื้นที่การศึกษา สพป.สิงห์บุรี',
    updatedAt: '2026-08-09T11:00:00Z',
  },
};

export const cleanSchoolName = (name: string): string => {
  if (!name) return '';
  return name
    .trim()
    .replace(/^โรงเรียน/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
};

export const cleanSchoolGroup = (group?: string): string => {
  if (!group) return '';
  return group
    .trim()
    .replace(/^กลุ่มโรงเรียน/g, '')
    .replace(/^กลุ่ม/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
};

export const findSchoolEvaluation = (
  evaluations: Record<string, SchoolEvaluation>,
  report: { schoolName: string; schoolGroup?: string; id?: string } | string | null | undefined
): SchoolEvaluation | null => {
  if (!evaluations || !report) return null;
  const schoolName = typeof report === 'string' ? report : report.schoolName;
  const schoolGroup = typeof report === 'string' ? undefined : report.schoolGroup;
  const reportId = typeof report === 'string' ? undefined : report.id;

  if (!schoolName) return null;

  const cleanedName = cleanSchoolName(schoolName);
  const cleanedGroup = cleanSchoolGroup(schoolGroup);

  // 1. Direct match by composite key if available
  if (cleanedGroup && evaluations[`${cleanedName}_${cleanedGroup}`]) {
    return evaluations[`${cleanedName}_${cleanedGroup}`];
  }

  // 2. Exact match by schoolId
  if (reportId && evaluations[reportId]) return evaluations[reportId];

  // 3. Direct key match
  if (evaluations[schoolName]) return evaluations[schoolName];
  if (evaluations[schoolName.trim()]) return evaluations[schoolName.trim()];

  // 4. Strict exact match by cleanSchoolName + cleanSchoolGroup among saved evaluation values
  for (const ev of Object.values(evaluations)) {
    if (!ev || !ev.schoolName) continue;
    const evCleanName = cleanSchoolName(ev.schoolName);
    const evCleanGroup = cleanSchoolGroup(ev.schoolGroup);

    if (evCleanName === cleanedName) {
      if (cleanedGroup && evCleanGroup) {
        if (evCleanGroup === cleanedGroup) return ev;
      } else {
        return ev;
      }
    }
  }

  // 5. Fallback: strict match by cleanSchoolName alone (no substring matching!)
  for (const ev of Object.values(evaluations)) {
    if (!ev || !ev.schoolName) continue;
    const evCleanName = cleanSchoolName(ev.schoolName);
    if (evCleanName === cleanedName) {
      return ev;
    }
  }

  return null;
};

export const getStoredEvaluations = (): Record<string, SchoolEvaluation> => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EVALUATIONS));
      return DEFAULT_EVALUATIONS;
    }
    const parsed = JSON.parse(raw);
    // Ensure all default schools exist even if v1 key was stored
    const merged = { ...DEFAULT_EVALUATIONS, ...parsed };
    return merged;
  } catch (err) {
    console.error('Failed to parse evaluations from localStorage', err);
    return DEFAULT_EVALUATIONS;
  }
};

export const getSchoolEvaluation = (schoolKey: string): SchoolEvaluation | null => {
  const evaluations = getStoredEvaluations();
  return findSchoolEvaluation(evaluations, schoolKey);
};

export const WEBHOOK_STORAGE_KEY = 'steam_google_sheet_webhook_url';

export const getStoredWebhookUrl = (): string => {
  return localStorage.getItem(WEBHOOK_STORAGE_KEY) || '';
};

export const saveStoredWebhookUrl = (url: string): void => {
  localStorage.setItem(WEBHOOK_STORAGE_KEY, url.trim());
};

export const saveSchoolEvaluation = (evaluation: SchoolEvaluation): Record<string, SchoolEvaluation> => {
  try {
    const current = getStoredEvaluations();
    // Mark as evaluated by user
    const updatedEval: SchoolEvaluation = {
      ...evaluation,
      isEvaluatedByUser: true,
      userTotalScore: evaluation.totalScore,
      userQualityLevel: evaluation.qualityLevel,
      updatedAt: new Date().toISOString(),
    };

    const schoolName = evaluation.schoolName;
    const schoolGroup = evaluation.schoolGroup;
    const trimmed = schoolName.trim();
    const cleanedName = cleanSchoolName(schoolName);
    const cleanedGroup = cleanSchoolGroup(schoolGroup);

    const updated = {
      ...current,
      [schoolName]: updatedEval,
      [trimmed]: updatedEval,
      [cleanedName]: updatedEval,
    };

    if (cleanedGroup) {
      updated[`${cleanedName}_${cleanedGroup}`] = updatedEval;
    }

    if (evaluation.schoolId) {
      updated[evaluation.schoolId] = updatedEval;
    }

    // Also update any existing key in current that matches cleaned name + group
    for (const key of Object.keys(current)) {
      const existing = current[key];
      if (existing && existing.schoolName) {
        const exName = cleanSchoolName(existing.schoolName);
        const exGroup = cleanSchoolGroup(existing.schoolGroup);
        if (exName === cleanedName && (!cleanedGroup || !exGroup || exGroup === cleanedGroup)) {
          updated[key] = updatedEval;
        }
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Fire-and-forget async real-time server & webhook save
    saveSchoolEvaluationAsync(updatedEval);

    return updated;
  } catch (err) {
    console.error('Failed to save evaluation to localStorage', err);
    return getStoredEvaluations();
  }
};

export const saveSchoolEvaluationAsync = async (evaluation: SchoolEvaluation): Promise<{ success: boolean; webhookSynced?: boolean }> => {
  try {
    const webhookUrl = getStoredWebhookUrl();
    const response = await fetch('/api/evaluations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        evaluation,
        webhookUrl,
      }),
    });

    const data = await response.json();
    return {
      success: data.success,
      webhookSynced: data.webhookSynced,
    };
  } catch (err) {
    console.warn('Backend real-time sync notice (using local storage):', err);
    return { success: false };
  }
};

export const deleteSchoolEvaluation = (schoolName: string): Record<string, SchoolEvaluation> => {
  try {
    const current = getStoredEvaluations();
    delete current[schoolName];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    return current;
  } catch (err) {
    console.error('Failed to delete evaluation from localStorage', err);
    return getStoredEvaluations();
  }
};

