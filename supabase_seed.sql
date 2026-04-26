-- ==========================================
-- SUPABASE SEED DATA FOR TRAVELTOUR
-- Run this in your Supabase SQL Editor
-- ==========================================

-- Clear existing data if needed (uncomment to run)
-- TRUNCATE reviews, tour_images, tours, destinations, users, bookings, payments, wishlist, promotions CASCADE;

-- 1. Insert a mock user
INSERT INTO users (id, full_name, email, password_hash, role) 
VALUES 
('11111111-1111-1111-1111-111111111111', 'Nguyễn Minh', 'testuser@example.com', 'hashed_password_placeholder', 'customer')
ON CONFLICT (email) DO NOTHING;

-- 2. Insert destinations
INSERT INTO destinations (id, name, country, description, image_url)
VALUES 
('21111111-1111-1111-1111-111111111111', 'Vịnh Hạ Long', 'Quảng Ninh', 'Di sản thiên nhiên thế giới UNESCO với hàng nghìn hòn đảo đá vôi kỳ vĩ.', '/images/halong.png'),
('22222222-2222-2222-2222-222222222222', 'Phố Cổ Hội An', 'Quảng Nam', 'Thương cảng cổ kính được bảo tồn nguyên vẹn với những chiếc đèn lồng rực rỡ.', '/images/hoian.png'),
('23333333-3333-3333-3333-333333333333', 'Sa Pa', 'Lào Cai', 'Thị trấn sương mù với những thửa ruộng bậc thang tuyệt đẹp và văn hóa bản địa độc đáo.', '/images/sapa.png'),
('24444444-4444-4444-4444-444444444444', 'Đà Lạt', 'Lâm Đồng', 'Thành phố ngàn hoa với khí hậu mát mẻ quanh năm và những rừng thông bạt ngàn.', '/images/dalat.png'),
('25555555-5555-5555-5555-555555555555', 'Phú Quốc', 'Kiên Giang', 'Đảo ngọc với những bãi biển cát trắng trải dài và nước biển trong xanh.', '/images/phuquoc.png'),
('26666666-6666-6666-6666-666666666666', 'Mũi Né', 'Bình Thuận', 'Thiên đường nghỉ dưỡng với những đồi cát mênh mông và bờ biển lộng gió.', '/images/muine.png')
ON CONFLICT (id) DO NOTHING;

-- 3. Insert tours
INSERT INTO tours (id, title, description, destination_id, price, duration, max_capacity)
VALUES 
('31111111-1111-1111-1111-111111111111', 'Du Thuyền Vịnh Hạ Long 3 Ngày 2 Đêm', 'Trải nghiệm kỳ nghỉ xa hoa trên du thuyền 5 sao, tham quan hang động bí ẩn và ngắm bình minh trên vịnh.', '21111111-1111-1111-1111-111111111111', 4500000, 3, 20),
('32222222-2222-2222-2222-222222222222', 'Khám Phá Phố Cổ Hội An và Thánh Địa Mỹ Sơn', 'Hành trình quay ngược thời gian, thưởng thức ẩm thực địa phương và thả đèn hoa đăng trên sông Hoài.', '22222222-2222-2222-2222-222222222222', 2500000, 2, 15),
('33333333-3333-3333-3333-333333333333', 'Trekking Fansipan & Trải Nghiệm Văn Hóa Bản Địa Sa Pa', 'Chinh phục nóc nhà Đông Dương, chiêm ngưỡng ruộng bậc thang và giao lưu văn hóa với người dân tộc thiểu số.', '23333333-3333-3333-3333-333333333333', 3200000, 4, 10)
ON CONFLICT (id) DO NOTHING;

-- 4. Insert tour images
INSERT INTO tour_images (id, tour_id, image_url)
VALUES 
(uuid_generate_v4(), '31111111-1111-1111-1111-111111111111', '/images/halong.png'),
(uuid_generate_v4(), '32222222-2222-2222-2222-222222222222', '/images/hoian.png'),
(uuid_generate_v4(), '33333333-3333-3333-3333-333333333333', '/images/sapa.png')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert reviews
INSERT INTO reviews (id, user_id, tour_id, rating, comment)
VALUES 
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '31111111-1111-1111-1111-111111111111', 5, 'Trải nghiệm tuyệt vời, nhân viên vô cùng nhiệt tình!'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '32222222-2222-2222-2222-222222222222', 4, 'Phố cổ rất đẹp nhưng hơi đông đúc vào cuối tuần.'),
(uuid_generate_v4(), '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 5, 'Chuyến đi đáng nhớ nhất trong đời, khung cảnh hùng vĩ ngoài sức tưởng tượng.')
ON CONFLICT (id) DO NOTHING;
