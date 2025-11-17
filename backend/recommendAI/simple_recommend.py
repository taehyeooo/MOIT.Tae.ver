import os
import json
import sys
from pymongo import MongoClient
from dotenv import load_dotenv
from bson import json_util, ObjectId

def get_meeting_recommendations():
    try:
        # --- 1. 환경 변수 로드 ---
        # 이 스크립트는 /backend/recommendAI/ 에 있으므로, .env 파일은 두 단계 위에 있습니다.
        # 하지만, 이 스크립트는 /backend/routes/meeting.js 에서 실행되므로,
        # 실행 컨텍스트는 /backend/ 입니다. 따라서 경로는 './.env'가 됩니다.
        dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
        load_dotenv(dotenv_path=dotenv_path)
        
        mongo_uri = os.environ.get("MONGO_URI")
        if not mongo_uri:
            raise ValueError("MONGO_URI가 환경 변수에 설정되지 않았습니다.")

        # --- 2. MongoDB 연결 ---
        client = MongoClient(mongo_uri)
        
        # MONGO_URI에 데이터베이스 이름이 포함되어 있다고 가정합니다.
        # 예: mongodb://.../myDatabase
        # 포함되지 않은 경우, client['database_name']으로 명시해야 합니다.
        db = client.get_default_database()
        if not db:
            # URI에 db이름이 없는 경우, 수동으로 지정 (예: 'moit-database')
            # 이 프로젝트에서는 URI에 포함되어 있을 가능성이 높습니다.
            raise ValueError("MongoDB URI에 데이터베이스 이름이 포함되어 있지 않습니다.")

        # --- 3. 최신 모임 5개 조회 ---
        # Meeting.js 모델에서 timestamps: true 옵션으로 createdAt 필드가 자동 생성됩니다.
        meetings_cursor = db.meetings.find(
            {}, # 모든 문서
            {"_id": 1} # _id 필드만 반환
        ).sort("createdAt", -1).limit(5)

        # --- 4. ID를 문자열 리스트로 변환 ---
        meeting_ids = [str(meeting["_id"]) for meeting in meetings_cursor]

        # --- 5. 결과를 JSON 배열로 표준 출력 ---
        # Node.js에서 이 출력을 직접 파싱합니다.
        print(json.dumps(meeting_ids))

    except Exception as e:
        # 오류가 발생하면 표준 에러로 출력하여 Node.js에서 잡을 수 있도록 합니다.
        print(f"Error in simple_recommend.py: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    get_meeting_recommendations()
