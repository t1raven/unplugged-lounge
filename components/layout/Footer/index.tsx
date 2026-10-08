import './style.scss';

interface Props {
  data: {
    siteName?: string;
    businessName?: string;
    phone?: string;
    address?: string;
    businessHours?: string;
  };
}

export default function Footer({ data }: Props) {
  return (
    <footer id="site-footer">
      <div className="inner">
        <div>
          <div className="footer-title">{data?.businessName}</div>
          <div className="footer-info">
            <ul>
              <li>
                <b>주소</b> {data?.address}
              </li>
              <li>
                <b>전화번호</b> {data?.phone}
              </li>
              <li>
                <b>영업시간</b> {data?.businessHours}
              </li>
            </ul>
          </div>
          <div className="footer-copy">© 2026 {data?.siteName}. All Rights Reserved.</div>
        </div>
      </div>
    </footer>
  );
}
