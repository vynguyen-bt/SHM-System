import tensorflow as tf

def transformer_block(inputs, num_heads, ff_dim, dropout=0.1):
    attention = tf.keras.layers.MultiHeadAttention(num_heads=num_heads, key_dim=inputs.shape[-1])(inputs, inputs)
    attention = tf.keras.layers.Dropout(dropout)(attention)
    out1 = tf.keras.layers.LayerNormalization(epsilon=1e-6)(inputs + attention)

    ffn = tf.keras.Sequential([
        tf.keras.layers.Dense(ff_dim, activation='relu'),
        tf.keras.layers.Dense(inputs.shape[-1])
    ])
    ffn_output = ffn(out1)
    ffn_output = tf.keras.layers.Dropout(dropout)(ffn_output)
    return tf.keras.layers.LayerNormalization(epsilon=1e-6)(out1 + ffn_output)

def build_transformer_model(input_dim, output_dim, num_heads=2, ff_dim=64):
    inputs = tf.keras.Input(shape=(input_dim, 1))
    x = tf.keras.layers.Conv1D(32, kernel_size=1, activation='relu')(inputs)
    x = transformer_block(x, num_heads=num_heads, ff_dim=ff_dim)
    x = tf.keras.layers.GlobalAveragePooling1D()(x)
    x = tf.keras.layers.Dense(64, activation='relu')(x)
    outputs = tf.keras.layers.Dense(output_dim, activation='linear')(x)
    return tf.keras.Model(inputs, outputs)
