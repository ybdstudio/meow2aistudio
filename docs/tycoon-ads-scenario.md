# Kịch bản quảng cáo chuẩn cho game Meow tycoon

Áp dụng cho mọi game Meow tycoon (Meow Pizza, Meow Burger, Meow Supermarket…). Lấy theo Meow Burger v1.6.4.
Thông số nằm trong `CFG.ads` / `CFG.gifts` (`src/00_config.js`). Tên placement trong code phải **giống hệt label trên HS dashboard** (cả chữ hoa và khoảng trắng). ID quảng cáo (ad unit) chỉnh trên HS, không sửa code.

## Quy tắc chung
- Mỗi lúc chỉ hiện **1 chip quảng cáo có thưởng**, đặt phía trên thẻ nhiệm vụ. Chip tự ẩn khi hết giờ. Khi đang mở popup, đồng hồ của chip tạm dừng.
- Chip quảng cáo có thưởng chỉ hiện từ nhiệm vụ nâng cấp bếp đầu tiên (`gifts.showAfter`, ở Burger là `t_upgrade`). Meow Rush và Coin Purchase theo luật riêng.
- Khi quảng cáo đang chạy: dừng game, tắt tiếng, chặn thao tác. Nếu quảng cáo không đóng, game tự chạy lại sau 100 s.
- Chỉ thưởng khi xem hết. Tắt sớm thì không được gì. Không có quảng cáo thì game vẫn chạy bình thường.
- Nút chỉ hiện khi `HSGame.canShowAd(label)` trả về true. Tắt một placement trên dashboard thì nút tự ẩn.
- Thưởng chỉ được cộng trong `onGive`. Số hiển thị lấy từ dashboard, số trong bảng dưới là mặc định khi không kết nối được HS.
- Thời gian chờ và lịch hiện quảng cáo tính theo thời gian chơi thật (`S.playTime`).

## Quảng cáo có thưởng

| Placement (label HS) | Khi nào xuất hiện | Thưởng | Nút hiện bao lâu / chờ bao lâu mới hiện lại |
|---|---|---|---|
| **Double Task Bonus** | Ngay sau khi xong nhiệm vụ có thưởng ≥ 20 xu | Nhận thêm lần nữa đúng thưởng nhiệm vụ đó (tối đa 150) | Hiện 10 s, chờ 45 s |
| **Buying Pad** (túi xu) | Nhiệm vụ đang yêu cầu mua, người chơi thiếu xu liên tục 12 s | Số xu còn thiếu, làm tròn chục, tối đa 50% giá món | Hiện đến khi đủ xu hoặc mua xong, chờ 90 s |
| **Meow Rush** | Nút cố định bên phải HUD từ nhiệm vụ "Serve 5 customers", cũng có trong Shop | Bếp nhanh ×2, đi nhanh hơn 30%, trong 60 s | Hết hiệu lực thì chờ 100 s |
| **VIP tip** | Ngay sau khi khách VIP trả tiền | Nhận lại đúng hóa đơn của VIP đó | Hiện 10 s, chờ 60 s |
| **Coin Purchase** | Không đủ xu khi nâng cấp (nút quảng cáo +100 thay cho nút mua), trong Shop, hoặc khi bấm "+" cạnh số xu | +100 xu | Chờ 120 s |
| **Grand Opening** | Khi mở khu mới và sau màn khai trương lớn | +200 xu | Hiện 15 s, không chờ |

## Quảng cáo xen giữa (interstitial)

| Placement | Khi nào chạy | Điều kiện |
|---|---|---|
| **<Theme> Break** (Burger: `Grill Break`, Pizza: `Oven Break`) | Tự chạy sau mỗi **45 s chơi**, bắt đầu từ nhiệm vụ lấy món đầu tiên (Burger: `t_take`, khoảng 1–2 phút đầu). Hiện thông báo "<Theme> break" 0,9 s trước khi chạy. | Không chạy khi đang mở popup, đang dừng hoặc đang có quảng cáo khác. Cách quảng cáo có thưởng gần nhất ≥ 30 s. Thời gian chỉ tính khi đang chơi. |

Cấu hình: `inter:{every:45, afterTask:'<task lấy món đầu tiên>', afterReward:30}`.

## Quà TikTok (không phải quảng cáo; HS trả qua onGive)
- **Revisit gift** (`tiktok_profile`): +100, mỗi ngày 1 lần. Vào game từ hồ sơ TikTok.
- **Share gift** (`share`): +50, mỗi ngày 1 lần.
- **Launch / Home** (`tiktok_shortcut`): +100, chỉ 1 lần. Thêm biểu tượng ra màn hình chính. Ngoài nút cố định, popup mời tự hiện 1 lần sau nhiệm vụ cải tạo quán.
- Cả 3 nút **hiện ngay khi loading xong**, ở cột bên trái dưới thanh xu. Dấu "!" đỏ báo quà còn nhận được. Nút Home luôn hiện.
- Chỉ gọi qua `HSGame.tiktokMission.start('profile'|'shortcut')` và `HSGame.share()`. Không cộng thưởng khi bấm nút.

## Mặc định khác cho game tycoon
- **Auto play tắt** (`CFG.autoPlay:false`): ẩn nút AUTO, bỏ qua lựa chọn AUTO trong save cũ.
- **Lưu cloud qua HS**: mỗi lần save thì gọi `HSGame.save(progress)`. Trong `onLoad`, giữ bản đi xa hơn (task cao hơn; nếu bằng nhau thì bản nhiều xu hơn).

## HS dashboard
- `iaa_config` lấy từ `<package>.hs-dashboard.json`, file này nằm cạnh thư mục upload. Gồm placements (7 label ở trên), rewards và items.
- Credentials để trong `src/native/hs-config.json` (`gameId`, `sdkKey`, `placements`), build sẽ tự điền vào. Client Secret không bao giờ được đưa vào code.
- hs-check phải 0 fail. Cảnh báo "has capitals" là chấp nhận được, vì label HS có chữ hoa.
