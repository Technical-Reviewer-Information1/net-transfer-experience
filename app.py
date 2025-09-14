import streamlit as st
import time
import random
import plotly.graph_objects as go
import plotly.express as px
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import threading
import queue

# ページ設定
st.set_page_config(
    page_title="ネットワーク転送速度体験アプリ",
    page_icon="🌐",
    layout="wide"
)

# カスタムCSS
st.markdown("""
<style>
.big-font {
    font-size:30px !important;
    font-weight: bold;
}
.medium-font {
    font-size:20px !important;
    font-weight: bold;
}
.speed-display {
    background-color: #1f77b4;
    color: white;
    padding: 20px;
    border-radius: 10px;
    text-align: center;
    margin: 10px 0;
}
.progress-bar {
    background-color: #f0f0f0;
    border-radius: 10px;
    padding: 3px;
}
</style>
""", unsafe_allow_html=True)

# セッション状態の初期化
if 'transfer_history' not in st.session_state:
    st.session_state.transfer_history = []
if 'is_transferring' not in st.session_state:
    st.session_state.is_transferring = False

def format_size(bytes_size):
    """バイトサイズを読みやすい形式に変換"""
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes_size < 1024:
            return f"{bytes_size:.2f} {unit}"
        bytes_size /= 1024
    return f"{bytes_size:.2f} TB"

def format_speed(bytes_per_second):
    """転送速度を読みやすい形式に変換"""
    bits_per_second = bytes_per_second * 8
    for unit in ['bps', 'Kbps', 'Mbps', 'Gbps']:
        if bits_per_second < 1000:
            return f"{bits_per_second:.2f} {unit}"
        bits_per_second /= 1000
    return f"{bits_per_second:.2f} Tbps"

def simulate_network_conditions(base_speed, network_type):
    """ネットワーク条件をシミュレート"""
    # ランダムな変動を追加（実際のネットワークの不安定性を模擬）
    variability = {
        "光ファイバー": 0.1,
        "ADSL": 0.3,
        "モバイル4G": 0.4,
        "モバイル3G": 0.5,
        "衛星通信": 0.6
    }
    
    variation = random.uniform(1 - variability[network_type], 1 + variability[network_type])
    return base_speed * variation

def calculate_transfer_time(file_size, speed):
    """転送時間を計算"""
    return file_size / speed

# メインタイトル
st.title('ネットワークの転送速度（pp.106-107）')
st.caption("Created by Dit-Lab.(Daiki Ito)")
st.caption("Supported by Tomoaki ATSUMI")
st.markdown("**ネットワーク通信の転送速度106-107を体験的に学習しよう！**")

# 設定エリア
st.markdown('<p class="medium-font">⚙️ 設106-107定</p>', unsafe_allow_html=True)

# 設定用のカラム
setting_col1, setting_col2 = st.columns(2)

with setting_col1:
    st.markdown("**ファイル設定**")

    # ファイルサイズ選択
    file_types = {
        "テキストファイル (1KB)": 1024,
        "写真 (5MB)": 5 * 1024 * 1024,
        "音楽ファイル (10MB)": 10 * 1024 * 1024,
        "動画ファイル (100MB)": 100 * 1024 * 1024,
        "映画ファイル (2GB)": 2 * 1024 * 1024 * 1024,
        "カスタム": 0
    }

    selected_file = st.selectbox("転送するファイルの種類", list(file_types.keys()))

    if selected_file == "カスタム":
        custom_size = st.number_input("ファイルサイズ (MB)", min_value=0.001, max_value=10000.0, value=1.0)
        file_size = custom_size * 1024 * 1024
    else:
        file_size = file_types[selected_file]

with setting_col2:
    st.markdown("**ネットワーク設定**")

    # ネットワーク種類選択
    network_speeds = {
        "光ファイバー": 100 * 1024 * 1024,  # 100Mbps
        "ADSL": 8 * 1024 * 1024,           # 8Mbps
        "モバイル4G": 20 * 1024 * 1024,     # 20Mbps
        "モバイル3G": 2 * 1024 * 1024,      # 2Mbps
        "衛星通信": 1 * 1024 * 1024         # 1Mbps
    }

    selected_network = st.selectbox("ネットワークの種類", list(network_speeds.keys()))
    base_speed = network_speeds[selected_network] / 8  # bpsからByte/sに変換

st.divider()

# メインコンテンツ
col1, col2 = st.columns([2, 1])

with col1:
    st.markdown('<p class="medium-font">📁 転送シミュレーション</p>', unsafe_allow_html=True)
    
    # ファイル情報表示
    st.info(f"**ファイル**: {selected_file}\n**サイズ**: {format_size(file_size)}\n**ネットワーク**: {selected_network}")
    
    # 転送ボタン
    if st.button("転送開始", disabled=st.session_state.is_transferring):
        st.session_state.is_transferring = True
        
        # プログレスバーとメトリクス用のプレースホルダー
        progress_bar = st.progress(0)
        speed_placeholder = st.empty()
        time_placeholder = st.empty()
        
        # 転送シミュレーション
        transferred = 0
        start_time = time.time()
        transfer_data = []
        
        while transferred < file_size:
            # 現在の速度を計算（ネットワーク条件を考慮）
            current_speed = simulate_network_conditions(base_speed, selected_network)
            
            # 転送量を更新（0.1秒間隔）
            chunk_size = min(current_speed * 0.1, file_size - transferred)
            transferred += chunk_size
            
            # 進行状況を更新
            progress = transferred / file_size
            progress_bar.progress(progress)
            
            # メトリクス表示
            elapsed_time = time.time() - start_time
            avg_speed = transferred / elapsed_time if elapsed_time > 0 else 0
            remaining_time = (file_size - transferred) / current_speed if current_speed > 0 else 0
            
            speed_placeholder.metric("現在の転送速度", format_speed(current_speed))
            time_placeholder.metric("残り時間", f"{remaining_time:.1f}秒")
            
            # データを記録
            transfer_data.append({
                'time': elapsed_time,
                'speed': current_speed * 8,  # bpsに変換
                'transferred': transferred
            })
            
            time.sleep(0.1)
        
        # 転送完了
        total_time = time.time() - start_time
        avg_speed = file_size / total_time
        
        st.success(f"転送完了！ 所要時間: {total_time:.2f}秒")
        
        # 履歴に追加
        st.session_state.transfer_history.append({
            'file_type': selected_file,
            'file_size': file_size,
            'network_type': selected_network,
            'time': total_time,
            'avg_speed': avg_speed,
            'timestamp': datetime.now(),
            'transfer_data': transfer_data
        })
        
        st.session_state.is_transferring = False
        st.rerun()

with col2:
    st.markdown('<p class="medium-font">📊 リアルタイム情報</p>', unsafe_allow_html=True)
    
    # 理論値表示
    theoretical_time = file_size / base_speed
    st.metric("理論転送時間", f"{theoretical_time:.2f}秒")
    st.metric("理論転送速度", format_speed(base_speed))
    
    # ネットワーク特性説明
    network_info = {
        "光ファイバー": "高速で安定した有線接続",
        "ADSL": "電話線を利用した接続",
        "モバイル4G": "高速モバイル通信",
        "モバイル3G": "従来のモバイル通信",
        "衛星通信": "遠隔地向け、遅延が大きい"
    }
    
    st.info(f"**{selected_network}の特徴:**\n{network_info[selected_network]}")

# 転送履歴とグラフ
if st.session_state.transfer_history:
    st.markdown('<p class="medium-font">📈 転送履歴と分析</p>', unsafe_allow_html=True)
    
    # 最新の転送データをグラフ化
    latest_transfer = st.session_state.transfer_history[-1]
    
    col3, col4 = st.columns(2)
    
    with col3:
        # 速度の時系列グラフ
        df = pd.DataFrame(latest_transfer['transfer_data'])
        
        fig_speed = px.line(df, x='time', y='speed', 
                           title='転送速度の変化',
                           labels={'time': '時間 (秒)', 'speed': '速度 (bps)'})
        fig_speed.update_layout(height=300)
        st.plotly_chart(fig_speed, use_container_width=True)
    
    with col4:
        # 転送量の累積グラフ
        df['transferred_mb'] = df['transferred'] / (1024 * 1024)
        
        fig_transfer = px.line(df, x='time', y='transferred_mb',
                              title='転送量の累積',
                              labels={'time': '時間 (秒)', 'transferred_mb': '転送量 (MB)'})
        fig_transfer.update_layout(height=300)
        st.plotly_chart(fig_transfer, use_container_width=True)
    
    # 履歴テーブル
    st.subheader("転送履歴")
    history_df = pd.DataFrame([
        {
            'ファイル種類': h['file_type'],
            'ファイルサイズ': format_size(h['file_size']),
            'ネットワーク': h['network_type'],
            '転送時間': f"{h['time']:.2f}秒",
            '平均速度': format_speed(h['avg_speed']),
            '実行時刻': h['timestamp'].strftime('%H:%M:%S')
        }
        for h in st.session_state.transfer_history[-10:]  # 最新10件
    ])
    
    st.dataframe(history_df, use_container_width=True)
    
    # 履歴クリアボタン
    if st.button("履歴をクリア"):
        st.session_state.transfer_history = []
        st.rerun()

# 比較機能
st.markdown('<p class="medium-font">⚖️ ネットワーク比較</p>', unsafe_allow_html=True)

if st.button("全ネットワークで比較実行"):
    comparison_data = []
    
    for network, speed in network_speeds.items():
        byte_speed = speed / 8
        transfer_time = file_size / byte_speed
        comparison_data.append({
            'ネットワーク': network,
            '理論速度': format_speed(byte_speed),
            '転送時間': f"{transfer_time:.2f}秒",
            '転送時間(分)': transfer_time / 60
        })
    
    comparison_df = pd.DataFrame(comparison_data)
    
    # 比較表
    st.dataframe(comparison_df.drop('転送時間(分)', axis=1), use_container_width=True)
    
    # 比較グラフ
    fig_comparison = px.bar(comparison_df, x='ネットワーク', y='転送時間(分)',
                           title=f'{selected_file}の転送時間比較',
                           labels={'転送時間(分)': '転送時間 (分)'})
    st.plotly_chart(fig_comparison, use_container_width=True)

# 学習コンテンツ
with st.expander("📚 ネットワーク速度について学ぼう"):
    st.markdown("""
    ### ネットワーク転送速度の基礎知識
    
    **🔢 単位について:**
    - **bps (bits per second)**: 1秒間に転送できるビット数
    - **Mbps**: 1秒間に100万ビット = 1,000,000 bps
    - **1バイト = 8ビット** なので、8Mbpsの回線では実際には1MB/s程度の転送速度
    
    **🌐 ネットワークの種類:**
    - **光ファイバー**: 光信号で高速通信、最も安定
    - **ADSL**: 電話線利用、距離により速度が変化
    - **4G/3G**: 無線通信、電波状況により速度が変動
    - **衛星通信**: 地上から衛星経由、遅延が大きいが広範囲をカバー
    
    **📈 実際の転送速度に影響する要因:**
    - ネットワークの混雑状況
    - 物理的な距離
    - 使用している機器の性能
    - 天候（無線通信の場合）
    
    **💡 日常での活用:**
    - 動画ストリーミング: 4K動画には約25Mbps必要
    - オンライン会議: 1-2Mbps程度で十分
    - ファイルダウンロード: 大きなファイルほど高速回線の恩恵大
    """)

# フッター
st.markdown("---")
st.markdown("**💡 ヒント**: 実際のネットワークでは理論値通りの速度が出ないことが多いです。このアプリではそのような現実的な変動も再現しています。")