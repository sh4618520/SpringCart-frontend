import axios from "axios";
import { useState, useEffect } from "react";

interface Product {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  imageUrl: string;
}

interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  price: number;
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>();
  const [loading, setLoading] = useState<boolean>(true);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false); // 모달 오픈 상태

  // 상품 목록, 장바구니 가져오기
  useEffect(() => {
    // 백엔드 주소로 상품 목록 Get 요청
    axios
      .get<Product[]>("http://localhost:8080/api/products")
      .then((response) => {
        setProducts(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("데이터 가져오기 실패ㅠ :", error);
        setLoading(false);
      });

    fetchCartItems();
  }, []);

  // 장바구니 상태 가져오는 함수
  const fetchCartItems = () => {
    axios
      .get<CartItem[]>("http://localhost:8080/api/carts")
      .then((response) => {
        setCartItems(response.data);
      })
      .catch((error) => console.error("장바구니 조회 실패 :", error));
  };

  // 장바구니 담기 버튼 클릭 이벤트 헨들러
  const handleAddToCart = (productId: number, productName: string) => {
    axios
      .post(`http://localhost:8080/api/carts?productId=${productId}&quantity=1`)
      .then((response) => {
        alert(
          `🎉 [${productName}] 장바구니 담기 성공!\n백엔드 메시지: ${response.data}`,
        );
        fetchCartItems(); //장바구니 동기화
      })
      .catch((error) => {
        console.error("장바구니 담기 실패 :", error);
        alert("장바구니 담기에 실패했습니다. 콘솔창 에러를 확인해보세요.");
      });
  };

  const handleUpdateQuantity = (
    cartItemId: number,
    currentQuantity: number,
    delta: number,
  ) => {
    const newQuantity = currentQuantity + delta;

    if (newQuantity < 1) {
      alert("수량은 최소 1개 이상이어야 합니다.");
      return;
    }

    axios
      .put(
        `http://localhost:8080/api/carts/${cartItemId}?quantity=${newQuantity}`,
      )
      .then((response) => {
        fetchCartItems(); //장바구니 동기화
      })
      .catch((error) => {
        console.error("수량 업데이트 실패 :", error);
        alert("수량 업데이트 중 오류가 발생했습니다.");
      });
  };

  const handelRemoveFromCart = (cartItemId: number, productName: string) => {
    if (
      !window.confirm(`⚠️ [${productName}] 장바구니에서 정말 삭제하시겠습니까?`)
    ) {
      return; // 사용자가 취소를 누르면 함수 종료
    }

    axios
      .delete(`http://localhost:8080/api/carts/${cartItemId}`)
      .then((response) => {
        alert("🗑️ 장바구니에서 상품이 제거되었습니다.");
        fetchCartItems(); //장바구니 동기화
      })
      .catch((error) => {
        console.error("장바구니 제거 실패 :", error);
        alert("삭제 중 오류가 발생했습니다.");
      });
  };

  // 장바구니 총금액 합산
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  if (loading)
    return <div style={styles.loading}>로딩 중... 조금만 기다려주세요!</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>🛒 코딩 쇼핑몰 🛒</h1>
        <button style={styles.cartButton} onClick={() => setIsCartOpen(true)}>
          💼 내 장바구니 ({cartItems.length})
        </button>
      </div>

      <div style={styles.grid}>
        {products?.map((product) => (
          <div key={product.id} style={styles.card}>
            <div style={styles.imgPlaceholder}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={styles.productImage}
              />
            </div>
            <h3 style={styles.productName}>{product.name}</h3>
            <p style={styles.category}>태그: {product.categoryName}</p>
            <p style={styles.price}>{product.price.toLocaleString()}원</p>
            <button
              style={styles.button}
              onClick={() => handleAddToCart(product.id, product.name)}
            >
              장바구니 담기
            </button>
          </div>
        ))}
      </div>

      {/* 🚨 장바구니 팝업 모달 (isCartOpen이 true일 때만 화면에 레이어로 뜸) */}
      {isCartOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: "#333" }}>내 장바구니 목록</h2>
              <button
                style={styles.closeButton}
                onClick={() => setIsCartOpen(false)}
              >
                ❌
              </button>
            </div>

            <div style={styles.modalBody}>
              {cartItems.length === 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    color: "#999",
                    padding: "40px 0",
                  }}
                >
                  장바구니가 비어있습니다!
                </p>
              ) : (
                cartItems.map((item) => (
                  <div key={item.cartItemId} style={styles.cartItemRow}>
                    {/* 1. 왼쪽: 상품명, 가격, 수량 정보 */}
                    <div
                      style={{
                        flex: 1,
                        paddingRight: "15px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        justifyContent: "center",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "600",
                          color: "#222",
                          fontSize: "16px",
                          lineHeight: "1.2",
                          marginBottom: "6px",
                        }}
                      >
                        {item.productName}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            color: "#555",
                            marginRight: "4px",
                          }}
                        >
                          {item.price.toLocaleString()}원 x
                        </span>

                        {/* 마이너스 버튼 */}
                        <button
                          style={styles.qtyButton}
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartItemId,
                              item.quantity,
                              -1,
                            )
                          }
                        >
                          -
                        </button>

                        {/* 현재 수량 표시 */}
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#333",
                            fontSize: "14px",
                            minWidth: "16px",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </span>

                        {/* 플러스 버튼 */}
                        <button
                          style={styles.qtyButton}
                          onClick={() =>
                            handleUpdateQuantity(
                              item.cartItemId,
                              item.quantity,
                              1,
                            )
                          }
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* 2. 오른쪽: 삭제 버튼 및 총 금액 */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        minWidth: "120px",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: "700",
                          color: "#ff4757",
                          fontSize: "16px",
                        }}
                      >
                        {(item.price * item.quantity).toLocaleString()}원
                      </div>
                      <button
                        style={styles.deleteButton}
                        onClick={() =>
                          handelRemoveFromCart(
                            item.cartItemId,
                            item.productName,
                          )
                        }
                        title="장바구니에서 삭제"
                      >
                        ❌
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={styles.modalFooter}>
              <h3 style={{ margin: 0, color: "#333" }}>
                총 결제 금액:{" "}
                <span style={{ color: "#007bff" }}>
                  {totalPrice.toLocaleString()}원
                </span>
              </h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// CSS 스타일링
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 20px",
    fontFamily: "system-ui",
    backgroundColor: "#121212",
    minHeight: "100vh",
    color: "#fff",
  }, // 완벽한 딥 다크모드
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
    borderBottom: "1px solid #333",
    paddingBottom: "20px",
  },
  title: { margin: 0, color: "#fff" },
  cartButton: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "16px",
    boxShadow: "0 4px 12px rgba(0,123,255,0.3)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
    gap: "30px",
  },
  card: {
    border: "1px solid #2d2d2d",
    borderRadius: "12px",
    padding: "20px",
    textAlign: "center",
    boxShadow: "0 4px 6px rgba(0,0,0,0.2)",
    backgroundColor: "#1e1e1e",
  },
  imgPlaceholder: {
    width: "100%",
    height: "150px",
    backgroundColor: "#2d2d2d",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "15px",
    overflow: "hidden", // 👈 내부 이미지가 상자 밖으로 삐져나가지 못하게 컷트!
  },
  productImage: {
    width: "100%", // 👈 상자 가로폭에 100% 맞추기
    height: "100%", // 👈 상자 세로폭에 100% 맞추기
    objectFit: "cover", // 👈 중요! 이미지가 찌그러지지 않고 비율 유지하면서 상자에 꽉 차게 채우는 치트키
  },
  productName: { fontSize: "18px", margin: "10px 0", color: "#fff" },
  category: { fontSize: "14px", color: "#aaa", margin: "5px 0" },
  price: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#ff4757",
    margin: "15px 0",
  },
  button: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
  },
  qtyButton: {
    backgroundColor: "#f1f2f6",
    border: "none",
    color: "#333",
    fontSize: "12px",
    fontWeight: "bold",
    width: "22px",
    height: "22px",
    borderRadius: "4px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s",
  },
  deleteButton: {
    background: "none",
    border: "none",
    fontSize: "16px",
    cursor: "pointer",
    padding: "6px",
    borderRadius: "50%", // 👈 둥근 원형 베이스로 변경
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    marginLeft: "10px",
  },
  loading: {
    textAlign: "center",
    fontSize: "24px",
    marginTop: "100px",
    fontWeight: "bold",
    color: "#fff",
  },

  // ✨ 세련된 화이트 테마 모달 영작 (다크 웹 화면 위에서 눈에 확 띄게 배색!)
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "450px",
    borderRadius: "16px",
    padding: "25px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
    display: "flex",
    flexDirection: "column",
    maxHeight: "70vh",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid #eee",
    paddingBottom: "15px",
  },
  closeButton: {
    background: "none",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
  },
  modalBody: { padding: "15px 0", overflowY: "auto", flex: 1 },
  cartItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center", // 👈 세로축 무조건 정중앙 정렬 고정!
    padding: "16px 0",
    borderBottom: "1px solid #eee",
  },
  modalFooter: {
    borderTop: "1px solid #eee",
    paddingTop: "15px",
    textAlign: "right",
  },
};

export default App;
