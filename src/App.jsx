import { useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from './lib/supabase.js';

const ANIMAL_LABELS = ['새', '햄스터', '고슴도치', '토끼', '파충류'];

function App() {
  const [hospitals, setHospitals] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadHospitals() {
      if (!isSupabaseConfigured) {
        setLoading(false);
        return;
      }

      try {
        const { data, error: queryError } = await supabase
          .from('hospitals')
          .select(`
            *,
            hospital_animals (
              animals ( name )
            )
          `)
          .order('name', { ascending: true });

        if (queryError) throw queryError;

        setHospitals(data ?? []);
      } catch (err) {
        console.error('병원 정보 조회 오류:', err);
        setError('병원 정보를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.');
      } finally {
        setLoading(false);
      }
    }

    loadHospitals();
  }, []);

  const getAnimalNames = (hospital) =>
    (hospital.hospital_animals ?? [])
      .map((item) => item.animals?.name)
      .filter(Boolean);

  return (
    <div className="app">
      <header className="site-header">
        <a className="brand" href="/" aria-label="EXO VET FIND 홈">
          <span className="brand-mark">E</span>
          <span>EXO VET FIND</span>
        </a>
        <span className="header-caption">특수 동물 전문 병원 찾기</span>
      </header>

      <main>
        <section className="hero">
          <span className="eyebrow">EXOTIC ANIMAL VETERINARY FINDER</span>
          <h1>
            소중한 가족을 위한
            <br />
            <span>전문 동물병원 찾기</span>
          </h1>
          <p>
            새부터 파충류까지, 특수 동물을 진료하는 병원 정보를
            <br className="desktop-break" />
            한곳에서 확인하고 공유해 보세요.
          </p>
          <div className="animal-tags">
            {ANIMAL_LABELS.map((animal) => (
              <span key={animal}>{animal}</span>
            ))}
          </div>
        </section>

        <section className="hospital-section">
          <div className="section-heading">
            <div>
              <span className="eyebrow">HOSPITAL DIRECTORY</span>
              <h2>전문 동물병원</h2>
              <p>특수 동물 진료 정보를 확인해 보세요.</p>
            </div>
            <span className="result-count">
              총 {hospitals.length}개 병원
            </span>
          </div>

          {!isSupabaseConfigured ? (
            <div className="notice-panel">
              <span className="notice-icon">i</span>
              <h3>데이터베이스 연결이 필요합니다.</h3>
              <p>
                Supabase 접속 정보를 설정하면 병원 목록을 불러올 수 있습니다.
              </p>
            </div>
          ) : loading ? (
            <div className="notice-panel">
              <div className="loader" />
              <p>병원 정보를 불러오고 있습니다.</p>
            </div>
          ) : error ? (
            <div className="notice-panel error-panel">
              <h3>정보를 불러오지 못했습니다.</h3>
              <p>{error}</p>
            </div>
          ) : hospitals.length === 0 ? (
            <div className="notice-panel">
              <span className="notice-icon">+</span>
              <h3>등록된 병원 정보가 아직 없습니다.</h3>
              <p>
                병원 데이터를 등록하면 이곳에서 목록을 확인할 수 있습니다.
              </p>
            </div>
          ) : (
            <div className="hospital-grid">
              {hospitals.map((hospital) => (
                <button
                  className="hospital-card"
                  key={hospital.id}
                  onClick={() => setSelectedHospital(hospital)}
                >
                  <div className="card-top">
                    <span className="card-category">동물병원</span>
                    <span className={`verification ${hospital.verification_status === '확인됨' ? 'verified' : ''}`}>
                      {hospital.verification_status}
                    </span>
                  </div>
                  <h3>{hospital.name}</h3>
                  <p className="hospital-address">{hospital.address}</p>
                  <div className="card-animals">
                    {getAnimalNames(hospital).length > 0
                      ? getAnimalNames(hospital).map((animal) => (
                          <span key={animal}>{animal}</span>
                        ))
                      : <span>진료 동물 정보 미등록</span>}
                  </div>
                  <span className="card-link">상세정보 보기 →</span>
                </button>
              ))}
            </div>
          )}
        </section>

        <section className="trust-note">
          <strong>정보 확인 안내</strong>
          <p>
            병원 정보의 확인 상태는 실제 확인 여부를 기준으로 표시합니다.
            등록된 정보가 현재 진료 가능 여부를 보증하지는 않으므로
            방문 전 병원에 직접 문의해 주세요.
          </p>
        </section>
      </main>

      <footer className="site-footer">
        <strong>EXO VET FIND</strong>
        <p>특수 동물 보호자를 위한 병원 정보 공유 서비스</p>
      </footer>

      {selectedHospital && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedHospital(null)}
        >
          <section
            className="hospital-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedHospital(null)}
              aria-label="닫기"
            >
              ×
            </button>
            <span className="eyebrow">HOSPITAL INFORMATION</span>
            <h2 id="modal-title">{selectedHospital.name}</h2>
            <span className="verification">
              정보 상태: {selectedHospital.verification_status}
            </span>
            <dl className="detail-list">
              <dt>주소</dt>
              <dd>{selectedHospital.address}</dd>
              <dt>연락처</dt>
              <dd>{selectedHospital.phone || '등록된 정보 없음'}</dd>
              <dt>웹사이트</dt>
              <dd>
                {selectedHospital.website_url ? (
                  <a href={selectedHospital.website_url} target="_blank" rel="noreferrer">
                    병원 웹사이트 방문
                  </a>
                ) : '등록된 정보 없음'}
              </dd>
              <dt>소개</dt>
              <dd>{selectedHospital.description || '등록된 소개가 없습니다.'}</dd>
              <dt>진료 동물</dt>
              <dd>{getAnimalNames(selectedHospital).join(', ') || '등록된 정보 없음'}</dd>
            </dl>
            <p className="source-note">
              정보 출처: {selectedHospital.source_note || '출처 정보 미등록'}
            </p>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;
