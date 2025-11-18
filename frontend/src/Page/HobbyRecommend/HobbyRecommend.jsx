import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaUsers, FaFire, FaUserPlus } from 'react-icons/fa';

// --- 데이터 영역: php/hobby_recommendation.php의 49개 문항을 변환 ---

const surveyQuestions = [
    // 1단계: 나의 현실적인 일상 점검하기 (12문항)
    { id: 'Q1', type: 'choice', text: '1. 일주일에 새로운 활동을 위해 온전히 사용할 수 있는 시간은 어느 정도인가요?', options: ['1시간 미만', '1시간 ~ 3시간', '3시간 ~ 5시간', '5시간 이상'] },
    { id: 'Q2', type: 'choice', text: '2. 한 달에 새로운 활동을 위해 부담 없이 지출할 수 있는 예산은 얼마인가요?', options: ['거의 없음 또는 3만원 미만', '3만원 ~ 5만원', '5만원 ~ 10만원', '10만원 이상'] },
    { id: 'Q3', type: 'scale', text: '3. 평소 하루를 보낼 때, 당신의 신체적 에너지 수준은 어느 정도라고 느끼시나요?', scaleLabels: ['거의 방전', '매우 활기참'] },
    { id: 'Q4', type: 'scale', text: '4. 집 밖의 다른 장소로 혼자 이동하는 것이 얼마나 편리한가요?', scaleLabels: ['매우 불편하고 거의 불가능하다.', '매우 쉽고 편리하다.'] },
    { id: 'Q5', type: 'choice', text: '5. 다음 중 당신의 현재 신체 상태를 가장 잘 설명하는 것은 무엇인가요?', options: ['오랜 시간 앉아 있거나 서 있는 것이 힘들다.', '계단을 오르거나 조금만 걸어도 숨이 차다.', '만성적인 통증이나 피로감이 있다.', '딱히 신체적인 어려움은 없다.'] },
    { id: 'Q6', type: 'choice', text: '6. 활동 공간에 대한 다음 설명 중 더 끌리는 쪽은 어디인가요?', options: ['익숙하고 안전한 집 안에서 할 수 있는 활동', '집 근처에서 가볍게 할 수 있는 야외 활동', '새로운 장소를 찾아가는 활동'] },
    { id: 'Q7', type: 'choice', text: '7. 당신은 어떤 환경에서 더 편안함을 느끼나요?', options: ['조용하고 자극이 적은 환경', '활기차고 다양한 볼거리가 있는 환경'] },
    { id: 'Q8', type: 'choice', text: '8. 새로운 것을 배울 때 어떤 방식을 더 선호하시나요?', options: ['정해진 규칙이나 설명서 없이 자유롭게 탐색하는 방식', '명확한 가이드라인이나 단계별 지침이 있는 방식'] },
    { id: 'Q9', type: 'choice', text: '9. 다음 중 당신이 더 피하고 싶은 활동은 무엇인가요?', options: ['세밀한 집중력이나 기억력이 많이 요구되는 활동', '빠르거나 순발력이 요구되는 활동'] },
    { id: 'Q10', type: 'checkbox', text: '10. 이전에 무언가를 배우거나 시도하다 그만둔 경험이 있다면, 주된 이유는 무엇이었나요? (중복 선택 가능)', options: ['생각보다 재미가 없어서', '생각보다 너무 어렵고 실력이 늘지 않아서', '시간이나 돈이 부족해서', '함께하는 사람들과 어울리기 힘들어서', '건강상의 문제나 체력이 부족해서'] },
    { id: 'Q11', type: 'scale', text: '11. "새로운 것을 시작하는 것 자체가 큰 스트레스와 부담으로 느껴진다."', scaleLabels: ['전혀 그렇지 않다', '매우 그렇다'] },
    { id: 'Q12', type: 'choice', text: '12. 당신의 주거 환경은 새로운 활동을 하기에 어떻다고 생각하시나요?', options: ['활동에 집중할 수 있는 독립된 공간이 있다.', '공용 공간을 사용해야 해서 제약이 있다.', '층간 소음 등 주변 환경이 신경 쓰인다.', '공간이 협소하여 활동에 제약이 있다.'] },
    
    // 2단계: 나의 마음 상태 들여다보기 (18문항)
    { id: 'Q13', type: 'scale', text: '13. "나는 어떤 일에 실패하거나 실수를 했을 때, 나 자신을 심하게 비난하고 자책하는 편이다."', scaleLabels: ['전혀 그렇지 않다', '매우 그렇다'] },
    { id: 'Q14', type: 'scale', text: '14. "나는 나의 단점이나 부족한 부분도 너그럽게 받아들이려고 노력한다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q15', type: 'scale', text: '15. "나는 다른 사람의 평가나 시선에 매우 민감하다."', scaleLabels: ['전혀 그렇지 않다', '매우 그렇다'] },
    { id: 'Q16', type: 'scale', text: '16. "나는 무언가를 할 때 \'완벽하게\' 해내야 한다는 압박감을 느낀다."', scaleLabels: ['전혀 그렇지 않다', '매우 그렇다'] },
    { id: 'Q17', type: 'scale', text: '17. "괴로운 감정이나 생각이 들 때, 애써 외면하기보다 차분히 바라보려고 하는 편이다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q18', type: 'scale', text: '18. "지금 당장 새로운 사람들을 만나야 한다고 상상하면, 심한 불안감이나 불편함이 느껴진다."', scaleLabels: ['전혀 그렇지 않다', '매우 그렇다'] },
    { id: 'Q19', type: 'scale', text: '19. "낯선 사람들과의 대화보다는 친한 사람과의 깊은 대화가 훨씬 편안하다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q20', type: 'scale', text: '20. "나는 다른 사람들에게 도움을 요청하는 것을 어려워한다."', scaleLabels: ['전혀 그렇지 않다', '매우 그렇다'] },
    { id: 'Q21', type: 'choice', text: '21. "최근 일주일간 당신의 외출 및 사회적 활동 수준은 어떠했나요?"', options: ['거의 방에서만 시간을 보냈다.', '집 안에서는 활동하지만 외출은 거의 하지 않았다.', '편의점 방문 등 필수적인 용무로만 잠시 외출했다.', '산책 등 혼자 하는 활동을 위해 외출한 적이 있다.', '다른 사람과 만나는 활동을 위해 외출한 적이 있다.'] },
    { id: 'Q22', type: 'scale', text: '22. "나는 혼자라는 사실이 외롭게 느껴지기보다, 오히려 편안하고 자유롭게 느껴진다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q23', type: 'scale', text: '23. "활동을 할 때, 다른 사람과 경쟁하는 상황은 가급적 피하고 싶다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q24', type: 'scale', text: '24. "함께 무언가를 할 때, 내가 주도하기보다는 다른 사람의 의견을 따르는 것이 더 편하다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q25', type: 'choice', text: '25. 요즘 당신의 기분 상태를 가장 잘 나타내는 단어는 무엇인가요?', options: ['무기력함', '불안함', '외로움', '지루함', '평온함'] },
    { id: 'Q26', type: 'scale', text: '26. "요즘 들어 무언가에 집중하는 것이 어렵게 느껴진다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q27', type: 'scale', text: '27. "나는 예측 불가능한 상황보다, 계획되고 구조화된 상황에서 안정감을 느낀다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q28', type: 'scale', text: '28. "사소한 일에도 쉽게 지치거나 스트레스를 받는다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q29', type: 'scale', text: '29. "나는 힘든 일이 있을 때, 그 문제 자체에 대해 생각하기보다 다른 무언가에 몰두하며 잊으려고 하는 편이다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q30', type: 'scale', text: '30. "나는 다른 사람들이 나를 있는 그대로 이해해주지 못한다고 느낄 때가 많다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },

    // 3단계: 내가 바라는 활동의 모습 그려보기 (18문항)
    { id: 'Q31', type: 'choice', text: '31. 새로운 활동을 통해 당신이 가장 얻고 싶은 것은 무엇인가요? (가장 중요한 것 1개 선택)', options: ['성취: 새로운 기술을 배우고 실력이 느는 것을 확인하는 것', '회복: 복잡한 생각에서 벗어나 편안하게 재충전하는 것', '연결: 좋은 사람들과 교류하며 소속감을 느끼는 것', '활력: 몸을 움직여 건강해지고 에너지를 얻는 것'] },
    { id: 'Q32', type: 'choice', text: '32. 다음 문장들 중, 현재 당신의 마음에 가장 와닿는 것은 무엇인가요?', options: ['"무언가에 깊이 몰입해서 시간 가는 줄 모르는 경험을 하고 싶다."', '"결과물에 상관없이 과정 자체를 즐기고 싶다."', '"나도 누군가에게 도움이 되는 가치 있는 일을 하고 싶다."', '"그저 즐겁게 웃을 수 있는 시간이 필요하다."'] },
    { id: 'Q33', type: 'scale', text: '33. 새로운 지식이나 기술을 배우는 것', scaleLabels: ['전혀 중요하지 않음', '매우 중요함'] },
    { id: 'Q34', type: 'scale', text: '34. 마음의 평화와 안정을 얻는 것', scaleLabels: ['전혀 중요하지 않음', '매우 중요함'] },
    { id: 'Q35', type: 'scale', text: '35. 다른 사람들과 유대감을 형성하는 것', scaleLabels: ['전혀 중요하지 않음', '매우 중요함'] },
    { id: 'Q36', type: 'scale', text: '36. 신체적인 건강과 활력을 증진하는 것', scaleLabels: ['전혀 중요하지 않음', '매우 중요함'] },
    { id: 'Q37', type: 'scale', text: '37. 나만의 개성과 창의성을 표현하는 것', scaleLabels: ['전혀 중요하지 않음', '매우 중요함'] },
    { id: 'Q38', type: 'scale', text: '38. 나의 삶을 스스로 통제하고 있다는 느낌을 갖는 것', scaleLabels: ['전혀 중요하지 않음', '매우 중요함'] },
    { id: 'Q39', type: 'choice', text: '39. 당신에게 가장 이상적인 활동 환경을 상상해보세요. 다음 중 가장 끌리는 것을 하나만 선택해주세요.', options: ['단독형: 누구에게도 방해받지 않는 나만의 공간에서 혼자 하는 활동', '병렬형: 다른 사람들이 주변에 있지만, 각자 자기 활동에 집중하는 조용한 공간 (예: 도서관, 카페)', '저강도 상호작용형: 선생님이나 안내자가 활동을 이끌어주는 소규모 그룹 (예: 강좌, 워크숍)', '고강도 상호작용형: 공통의 목표를 위해 협력하거나 자유롭게 소통하는 모임 (예: 동호회, 팀 스포츠)'] },
    { id: 'Q40', type: 'choice', text: '40. 누군가와 함께 활동한다면, 어떤 형태를 가장 선호하시나요?', options: ['마음이 잘 맞는 단 한 명의 파트너와 함께하는 것', '3~4명 정도의 소규모 그룹', '다양한 사람들을 만날 수 있는 대규모 그룹'] },
    { id: 'Q41', type: 'scale', text: '41. "나는 명확한 목표나 결과물이 있는 활동을 선호한다." (예: 그림 완성, 요리 완성)', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q42', type: 'scale', text: '42. "나는 활동을 할 때, 정해진 규칙을 따르기보다 나만의 방식으로 자유롭게 하는 것이 좋다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
    { id: 'Q43', type: 'scale', text: '43. 자연과 함께하는 활동에 얼마나 관심이 있으신가요? (예: 산책, 텃밭 가꾸기)', scaleLabels: ['전혀 관심 없음', '매우 관심 많음'] },
    { id: 'Q44', type: 'scale', text: '44. 손으로 무언가를 만드는 활동(예: 공예, 요리)에 얼마나 관심이 있으신가요?', scaleLabels: ['전혀 관심 없음', '매우 관심 많음'] },
    { id: 'Q45', type: 'scale', text: '45. 지적인 탐구 활동(예: 책 읽기, 새로운 분야 공부)에 얼마나 관심이 있으신가요?', scaleLabels: ['전혀 관심 없음', '매우 관심 많음'] },
    { id: 'Q46', type: 'scale', text: '46. 음악, 미술, 글쓰기 등 창작 및 감상 활동에 얼마나 관심이 있으신가요?', scaleLabels: ['전혀 관심 없음', '매우 관심 많음'] },
    { id: 'Q47', type: 'scale', text: '47. 몸을 움직이는 신체 활동(예: 운동, 춤)에 얼마나 관심이 있으신가요?', scaleLabels: ['전혀 관심 없음', '매우 관심 많음'] },
    { id: 'Q48', type: 'scale', text: '48. "만약 새로운 그룹 활동에 참여한다면, 기존 멤버들이 끈끈하게 뭉쳐 있는 곳보다는, 나와 같이 새로 시작하는 사람들이 많은 곳이 더 편할 것 같다."', scaleLabels: ['매우 그렇다', '전혀 그렇지 않다'] },
  
    // 4단계: 사진 업로드
    { 
        id: 'Q49_photo', 
        type: 'photo', 
        text: '📸 마지막으로, 당신의 일상이 담긴 사진을 올려주세요.',
        description: [
            "AI가 사진을 분석하여 당신의 잠재적인 관심사를 파악하는 데 도움을 줍니다.",
            "<strong>최근 한 달 동안</strong> 찍은 사진 중 마음에 드는 것을 골라주세요.",
            "과거의 사진 중 <strong>돌아가고 싶은 순간</strong>이나 <strong>간직하고 싶은 추억</strong>이 담긴 사진도 좋습니다.",
            "인물, 사물, 풍경, 음식 등 <strong>다양한 사진</strong>을 올릴수록 분석 정확도가 높아집니다."
        ]
    }
];

const stageHeaders = [
    { step: 1, title: "1단계: 나의 현실적인 일상 점검하기", subtitle: "당신의 현재 생활 환경과 현실적인 제약 요인을 파악합니다." },
    { step: 13, title: "2단계: 나의 마음 상태 들여다보기", subtitle: "당신의 현재 심리적 상태와 사회적 관계에 대한 생각을 이해합니다." },
    { step: 31, title: "3단계: 내가 바라는 활동의 모습 그려보기", subtitle: "새로운 활동을 통해 무엇을 얻고 싶은지 구체적으로 그려봅니다." },
    { step: 49, title: "4단계: 일상 사진으로 잠재 관심사 분석하기", subtitle: "AI가 사진을 분석하여 숨겨진 관심사를 찾아냅니다." }
];

// --- 컴포넌트 영역 ---

const StatsSidebar = () => {
    // (기존 StatsSidebar 코드와 동일 - 변경 없음)
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get('/api/stats');
                setStats(response.data);
            } catch (error) {
                console.error("통계 데이터 로딩 실패:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statItems = [
        { icon: FaUsers, label: '총 모임 수', value: stats?.totalMeetings, unit: '개' },
        { icon: FaFire, label: '가장 인기있는 카테고리', value: stats?.popularCategory, unit: '' },
        { icon: FaUserPlus, label: '이번 주 새 멤버', value: stats?.newUsersThisWeek, unit: '명' }
    ];

    if (loading) {
        return <div className="bg-white p-8 rounded-lg shadow-lg sticky top-32">로딩 중...</div>
    }

    return (
        <div className="bg-white p-8 rounded-lg shadow-lg sticky top-32">
            <h2 className="text-xl font-bold mb-4 border-b-2 border-blue-500 pb-2">MOIT 재미있는 통계</h2>
            <div className="space-y-6 mt-6">
                {statItems.map((item, index) => (
                    <div key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-blue-100 text-blue-500 rounded-lg">
                            <item.icon size={24} />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800 text-lg">{item.value} {item.unit}</p>
                            <span className="text-sm text-gray-500">{item.label}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const LoginPrompt = () => (
    // (기존 LoginPrompt 코드와 동일 - 변경 없음)
    <div className="text-center bg-white p-12 rounded-lg shadow-lg max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">로그인이 필요한 서비스입니다.</h2>
        <p className="text-gray-600 mb-8">
            MOIT의 맞춤 취미 추천을 받으려면 로그인을 해주세요!
        </p>
        <Link
            to="/login"
            className="inline-block px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
            로그인 페이지로 이동
        </Link>
    </div>
);

const Survey = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState({});
    const [previews, setPreviews] = useState([]); // 사진 미리보기용 state

    const currentQuestion = surveyQuestions[currentStep];
    const totalSteps = surveyQuestions.length;

    // 현재 단계에 맞는 헤더 찾기
    const currentHeader = stageHeaders.slice().reverse().find(h => (currentStep + 1) >= h.step);

    const handleNext = () => {
        if (currentStep < totalSteps - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(answers);
        }
    };
    
    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep + 1);
        }
    }

    // [수정] 단일 선택 (choice, scale) 핸들러
    const handleSelect = (value) => {
        const newAnswers = { ...answers, [currentQuestion.id]: value };
        setAnswers(newAnswers);

        // 마지막 단계(사진)가 아니면 자동 다음
        if (currentStep < totalSteps - 2) { 
            setTimeout(() => {
                if (currentStep < totalSteps - 1) {
                    setCurrentStep(currentStep + 1);
                }
            }, 300);
        }
    };

    // [신규] 체크박스 핸들러
    const handleCheckboxChange = (option) => {
        const currentAnswers = answers[currentQuestion.id] || [];
        let newAnswersArray;
        
        if (currentAnswers.includes(option)) {
            newAnswersArray = currentAnswers.filter(item => item !== option);
        } else {
            newAnswersArray = [...currentAnswers, option];
        }

        setAnswers({ ...answers, [currentQuestion.id]: newAnswersArray });
    };

    // [신규] 파일 핸들러
    const handleFileChange = (e) => {
        const files = e.target.files;
        setAnswers({ ...answers, [currentQuestion.id]: files });

        // 미리보기 생성
        const filePreviews = Array.from(files).map(file => {
            const reader = new FileReader();
            return new Promise(resolve => {
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });
        
        Promise.all(filePreviews).then(images => {
            setPreviews(images);
        });
    };

    // [수정] 답변 유무 확인 로직
    const isAnswered = () => {
        const answer = answers[currentQuestion.id];
        if (currentQuestion.type === 'checkbox') {
            return answer && answer.length > 0; // Q10은 하나 이상 선택해야 함
        }
        if (currentQuestion.type === 'photo') {
            return true; // 사진은 선택 사항 (없어도 다음/완료 가능)
        }
        return answer !== undefined;
    };

    const isLastStep = currentStep === totalSteps - 1;

    return (
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 bg-white p-8 rounded-lg shadow-lg">
                <div className="mb-8">
                    <div className="flex justify-between text-sm text-gray-500 mb-2">
                        <span>진행률</span>
                        <span>{currentStep + 1} / {totalSteps}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <motion.div 
                            className="bg-blue-600 h-2 rounded-full"
                            animate={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        />
                    </div>
                </div>

                {/* [신규] 단계별 헤더 */}
                {currentHeader && (
                    <div className="mb-8 p-4 bg-gray-50 rounded-lg">
                        <h2 className="text-xl font-bold text-gray-800">{currentHeader.title}</h2>
                        <p className="text-gray-600 text-sm">{currentHeader.subtitle}</p>
                    </div>
                )}
                
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                        className="min-h-[300px]" // 최소 높이 보장
                    >
                        <h3 className="text-xl font-semibold mb-6">{currentQuestion.text}</h3>
                        
                        {/* 1. choice 렌더링 */}
                        {currentQuestion.type === 'choice' && (
                            <div className="space-y-3">
                                {currentQuestion.options.map(opt => (
                                    <div key={opt} onClick={() => handleSelect(opt)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <label className="flex items-center cursor-pointer">
                                            <input type="radio" name={currentQuestion.id} value={opt} checked={answers[currentQuestion.id] === opt} readOnly className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"/>
                                            <span className="ml-3 text-gray-700">{opt}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 2. scale 렌더링 (커스텀 레이블 적용) */}
                        {currentQuestion.type === 'scale' && (
                             <div className="flex justify-between items-center px-2">
                                <span className="text-sm text-gray-500 text-center w-1/5">{currentQuestion.scaleLabels[0]}</span>
                                {[1, 2, 3, 4, 5].map(val => (
                                    <button key={val} onClick={() => handleSelect(val)}
                                        className={`w-12 h-12 rounded-full border-2 transition-all flex items-center justify-center font-bold text-lg ${answers[currentQuestion.id] === val ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'}`}>
                                        {val}
                                    </button>
                                ))}
                                <span className="text-sm text-gray-500 text-center w-1/5">{currentQuestion.scaleLabels[1]}</span>
                            </div>
                        )}

                        {/* 3. [신규] checkbox 렌더링 */}
                        {currentQuestion.type === 'checkbox' && (
                            <div className="space-y-3">
                                {currentQuestion.options.map(opt => (
                                    <div key={opt} onClick={() => handleCheckboxChange(opt)}
                                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${answers[currentQuestion.id]?.includes(opt) ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300'}`}>
                                        <label className="flex items-center cursor-pointer">
                                            <input type="checkbox" name={currentQuestion.id} value={opt} checked={answers[currentQuestion.id]?.includes(opt) || false} readOnly className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"/>
                                            <span className="ml-3 text-gray-700">{opt}</span>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* 4. [신규] photo 렌더링 */}
                        {currentQuestion.type === 'photo' && (
                            <div>
                                <div className="p-4 bg-gray-100 rounded-lg text-gray-700 space-y-2">
                                    {currentQuestion.description.map((line, idx) => (
                                        <p key={idx} dangerouslySetInnerHTML={{ __html: line }} />
                                    ))}
                                </div>
                                <input 
                                    type="file" 
                                    name="hobby_photos" 
                                    id="hobby_photos" 
                                    multiple 
                                    accept="image/*" 
                                    className="mt-4 block w-full text-sm text-gray-500
                                              file:mr-4 file:py-2 file:px-4
                                              file:rounded-full file:border-0
                                              file:text-sm file:font-semibold
                                              file:bg-blue-50 file:text-blue-700
                                              hover:file:bg-blue-100"
                                    onChange={handleFileChange}
                                />
                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    {previews.map((src, idx) => (
                                        <img key={idx} src={src} alt={`미리보기 ${idx+1}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                                    ))}
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
                
                <div className="mt-10 flex justify-between items-center">
                    <button onClick={handlePrev} disabled={currentStep === 0}
                        className="px-8 py-3 bg-gray-200 text-gray-700 font-bold rounded-lg disabled:opacity-50 hover:bg-gray-300 transition-colors">
                        이전
                    </button>
                    {isLastStep ? (
                        <button onClick={() => onComplete(answers)} disabled={!isAnswered()}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg disabled:bg-gray-300 hover:bg-blue-700 transition-colors">
                            결과 보기
                        </button>
                    ) : (
                        <button onClick={handleNext} disabled={!isAnswered()}
                            className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg disabled:bg-gray-300 hover:bg-blue-700 transition-colors">
                            다음
                        </button>
                    )}
                </div>
            </div>
            
            <StatsSidebar />
        </div>
    );
};

const Results = ({ recommendations, onReset }) => (
    // (기존 Results 코드와 동일 - 변경 없음)
    <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
             <h2 className="text-3xl font-bold mb-2 text-blue-600">🎉 맞춤 취미 추천</h2>
             <p className="text-gray-600 mb-8">AI가 회원님의 성향을 분석하여 3개의 취미를 추천해드려요!</p>
        </div>

        <div className="space-y-6 mt-8">
            {recommendations.length > 0 ? recommendations.map((hobby, index) => (
                <motion.div
                    key={`${hobby.hobby_id}-${index}`}
                    className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                >
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{hobby.name_ko}</h3>
                    <p className="text-gray-600 mb-4">{hobby.short_desc}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                        {(hobby.reason || '').split(' · ').map((tag, i) => (
                            tag && <span key={i} className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{tag.trim()}</span>
                        ))}
                    </div>
                    
                    <div className="text-right font-bold text-blue-600 text-lg">
                        추천도: {Math.round(hobby.score_total)}%
                    </div>
                </motion.div>
            )) : <div className="text-center p-8 bg-white rounded-lg shadow-md">추천할 만한 취미를 찾지 못했어요.</div>}
        </div>

        <div className="text-center mt-10">
            <button 
                onClick={onReset} 
                className="px-8 py-3 border-2 border-blue-500 text-blue-500 font-bold rounded-lg hover:bg-blue-50 transition-colors"
            >
                다시 설문하기
            </button>
        </div>
    </div>
);


// --- 메인 페이지 컴포넌트 ---
const HobbyRecommend = () => {
    const { user } = useAuth();
    const [step, setStep] = useState('loading');
    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const fetchResult = async () => {
            if (!user) {
                setStep('loginPrompt');
                return;
            }
            try {
                // [수정] 이미 저장된 '상세 설문' 결과를 가져오는 API (엔드포인트는 예시)
                const response = await axios.get('/api/survey/detailed-result', { withCredentials: true });
                if (response.data && response.data.recommendations) {
                    setRecommendations(response.data.recommendations);
                    setStep('results');
                }
            } catch (error) {
                if (error.response && error.response.status === 404) {
                    setStep('survey');
                } else {
                    console.error("저장된 설문결과 로딩 실패:", error);
                    setStep('survey');
                }
            }
        };
        fetchResult();
    }, [user]);
    
    // [수정] AI 추천 요청 함수 (FormData 사용)
    const getAiRecommendations = async (answers) => {
        try {
            console.log("Node.js 백엔드를 통해 AI 에이전트에 추천 요청을 보냅니다 (FormData)...");

            const formData = new FormData();
            const photoFiles = answers.Q49_photo;

            // 1. 사진 파일을 FormData에 추가
            if (photoFiles && photoFiles.length > 0) {
                Array.from(photoFiles).forEach((file) => {
                    // 'hobby_photos'는 PHP의 'hobby_photos[]'와 대응
                    formData.append('hobby_photos', file);
                });
            }

            // 2. 나머지 설문 답변(JSON)을 FormData에 추가
            const answersJson = { ...answers };
            delete answersJson.Q49_photo; // 파일 객체는 제외
            formData.append('answers', JSON.stringify(answersJson));

            const response = await axios.post(
                '/api/survey/recommend-detailed', // (주의: 새 엔드포인트 예시)
                formData, 
                { 
                    withCredentials: true,
                    headers: {
                        // Content-Type은 axios가 FormData와 함께 자동 설정
                    }
                }
            );
            return response.data || [];
        } catch (error) {
            console.error("AI 추천을 받아오는 중 오류 발생:", error);
            Swal.fire('AI 추천 실패', '추천을 받아오는 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.', 'error');
            return [];
        }
    };

    const handleSurveyComplete = async (answers) => {
        setStep('loading');
        
        const results = await getAiRecommendations(answers);

        const uniqueResults = results.reduce((acc, current) => {
            if (!acc.find(item => item.name_ko === current.name_ko)) {
                acc.push(current);
            }
            return acc;
        }, []).slice(0, 3);

        if (uniqueResults.length === 0) {
            setStep('survey');
            return;
        }
        
        setRecommendations(uniqueResults);

        // [수정] 상세 설문 결과를 저장하는 API (엔드포인트는 예시)
        if (user) {
            try {
                // (주의: 결과 저장은 FormData가 아닌 JSON으로 다시 보낼 수 있음)
                await axios.post('/api/survey/detailed-result', { answers, recommendations: uniqueResults }, { withCredentials: true });
            } catch (error) {
                console.error("결과 저장 중 오류 발생:", error);
            }
        }

        setStep('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setStep('survey');
        setRecommendations([]);
    };

    const renderContent = () => {
        // (기존 renderContent 코드와 동일 - 변경 없음)
        switch (step) {
            case 'loginPrompt':
                return <LoginPrompt />;
            case 'survey':
                return <Survey onComplete={handleSurveyComplete} />;
            case 'results':
                return <Results recommendations={recommendations} onReset={handleReset} />;
            case 'loading':
                 return <div className="text-center p-12 text-gray-500">AI가 회원님을 위한 취미를 분석 중입니다... 잠시만 기다려주세요.</div>;
            default:
                return <div className="text-center p-12 text-gray-500">사용자 정보를 확인하는 중...</div>;
        }
    };

    return (
        // (기존 HobbyRecommend 래퍼 코드와 동일 - 변경 없음)
        <div className="bg-gray-50 py-32 min-h-screen flex items-center">
            <div className="container mx-auto px-4">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HobbyRecommend;